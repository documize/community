// Copyright 2013 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package bmp

import (
	"bytes"
	"image"
	"io/ioutil"
	"os"
	"testing"
)

func openImage(filename string) (image.Image, error) {
	f, err := os.Open(testdataDir + filename)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	return Decode(f)
}

func TestEncode(t *testing.T) {
	img0, err := openImage("video-001.bmp")
	if err != nil {
		t.Fatal(err)
	}

	buf := new(bytes.Buffer)
	err = Encode(buf, img0)
	if err != nil {
		t.Fatal(err)
	}

	img1, err := Decode(buf)
	if err != nil {
		t.Fatal(err)
	}

	compare(t, img0, img1)
}

// BenchmarkEncode benchmarks the encoding of an image.
func BenchmarkEncode(b *testing.B) {
	img, err := openImage("video-001.bmp")
	if err != nil {
		b.Fatal(err)
	}
	s := img.Bounds().Size()
	b.SetBytes(int64(s.X * s.Y * 4))
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		Encode(ioutil.Discard, img)
	}
}
