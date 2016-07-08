// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package tiff

import (
	"image"
	"io/ioutil"
	"os"
	"strings"
	"testing"

	_ "image/png"
)

const testdataDir = "../testdata/"

// Read makes *buffer implements io.Reader, so that we can pass one to Decode.
func (*buffer) Read([]byte) (int, error) {
	panic("unimplemented")
}

func load(name string) (image.Image, error) {
	f, err := os.Open(testdataDir + name)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	img, _, err := image.Decode(f)
	if err != nil {
		return nil, err
	}
	return img, nil
}

// TestNoRPS tries to decode an image that has no RowsPerStrip tag.
// The tag is mandatory according to the spec but some software omits
// it in the case of a single strip.
func TestNoRPS(t *testing.T) {
	_, err := load("no_rps.tiff")
	if err != nil {
		t.Fatal(err)
	}
}

// TestNoCompression tries to decode an images that has no Compression tag.
// This tag is mandatory, but most tools interpret a missing value as no compression.
func TestNoCompression(t *testing.T) {
	_, err := load("no_compress.tiff")
	if err != nil {
		t.Fatal(err)
	}
}

// TestUnpackBits tests the decoding of PackBits-encoded data.
func TestUnpackBits(t *testing.T) {
	var unpackBitsTests = []struct {
		compressed   string
		uncompressed string
	}{{
		// Example data from Wikipedia.
		"\xfe\xaa\x02\x80\x00\x2a\xfd\xaa\x03\x80\x00\x2a\x22\xf7\xaa",
		"\xaa\xaa\xaa\x80\x00\x2a\xaa\xaa\xaa\xaa\x80\x00\x2a\x22\xaa\xaa\xaa\xaa\xaa\xaa\xaa\xaa\xaa\xaa",
	}}
	for _, u := range unpackBitsTests {
		buf, err := unpackBits(strings.NewReader(u.compressed))
		if err != nil {
			t.Fatal(err)
		}
		if string(buf) != u.uncompressed {
			t.Fatalf("unpackBits: want %x, got %x", u.uncompressed, buf)
		}
	}
}

func compare(t *testing.T, img0, img1 image.Image) {
	b0 := img0.Bounds()
	b1 := img1.Bounds()
	if b0.Dx() != b1.Dx() || b0.Dy() != b1.Dy() {
		t.Fatalf("wrong image size: want %s, got %s", b0, b1)
	}
	x1 := b1.Min.X - b0.Min.X
	y1 := b1.Min.Y - b0.Min.Y
	for y := b0.Min.Y; y < b0.Max.Y; y++ {
		for x := b0.Min.X; x < b0.Max.X; x++ {
			c0 := img0.At(x, y)
			c1 := img1.At(x+x1, y+y1)
			r0, g0, b0, a0 := c0.RGBA()
			r1, g1, b1, a1 := c1.RGBA()
			if r0 != r1 || g0 != g1 || b0 != b1 || a0 != a1 {
				t.Fatalf("pixel at (%d, %d) has wrong color: want %v, got %v", x, y, c0, c1)
			}
		}
	}
}

// TestDecode tests that decoding a PNG image and a TIFF image result in the
// same pixel data.
func TestDecode(t *testing.T) {
	img0, err := load("video-001.png")
	if err != nil {
		t.Fatal(err)
	}
	img1, err := load("video-001.tiff")
	if err != nil {
		t.Fatal(err)
	}
	img2, err := load("video-001-strip-64.tiff")
	if err != nil {
		t.Fatal(err)
	}
	img3, err := load("video-001-tile-64x64.tiff")
	if err != nil {
		t.Fatal(err)
	}
	img4, err := load("video-001-16bit.tiff")
	if err != nil {
		t.Fatal(err)
	}

	compare(t, img0, img1)
	compare(t, img0, img2)
	compare(t, img0, img3)
	compare(t, img0, img4)
}

// TestDecodeLZW tests that decoding a PNG image and a LZW-compressed TIFF image
// result in the same pixel data.
func TestDecodeLZW(t *testing.T) {
	img0, err := load("blue-purple-pink.png")
	if err != nil {
		t.Fatal(err)
	}
	img1, err := load("blue-purple-pink.lzwcompressed.tiff")
	if err != nil {
		t.Fatal(err)
	}

	compare(t, img0, img1)
}

// TestDecompress tests that decoding some TIFF images that use different
// compression formats result in the same pixel data.
func TestDecompress(t *testing.T) {
	var decompressTests = []string{
		"bw-uncompressed.tiff",
		"bw-deflate.tiff",
		"bw-packbits.tiff",
	}
	var img0 image.Image
	for _, name := range decompressTests {
		img1, err := load(name)
		if err != nil {
			t.Fatalf("decoding %s: %v", name, err)
		}
		if img0 == nil {
			img0 = img1
			continue
		}
		compare(t, img0, img1)
	}
}

// benchmarkDecode benchmarks the decoding of an image.
func benchmarkDecode(b *testing.B, filename string) {
	b.StopTimer()
	contents, err := ioutil.ReadFile(testdataDir + filename)
	if err != nil {
		panic(err)
	}
	r := &buffer{buf: contents}
	b.StartTimer()
	for i := 0; i < b.N; i++ {
		_, err := Decode(r)
		if err != nil {
			b.Fatal("Decode:", err)
		}
	}
}

func BenchmarkDecodeCompressed(b *testing.B)   { benchmarkDecode(b, "video-001.tiff") }
func BenchmarkDecodeUncompressed(b *testing.B) { benchmarkDecode(b, "video-001-uncompressed.tiff") }
