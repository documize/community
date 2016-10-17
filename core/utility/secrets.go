// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

package utility

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

var key = []byte("8456FHkQW1566etydT46jk39ghjfFhg4") // 32 bytes

// MakeMD5 returns the MD5 hash of a given string, usually a password.
/*
func MakeMD5(password string) []byte {
	hash := md5.New()
	if _, err := io.WriteString(hash, password); err != nil {
		log.Error("error in MakeMD5", err)
	}
	return hash.Sum(nil)
}
*/

// MakeAES creates an AES encryption of of a given string,
// using a hard-wired key value,
// suitable for use as an authentication token.
func MakeAES(secret string) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	b := EncodeBase64([]byte(secret))
	ciphertext := make([]byte, aes.BlockSize+len(b))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}
	cfb := cipher.NewCFBEncrypter(block, iv)
	cfb.XORKeyStream(ciphertext[aes.BlockSize:], b)
	return ciphertext, nil
}

// DecryptAES decrypts an AES encoded []byte,
// using a hard-wired key value,
// suitable for use when reading an authentication token.
func DecryptAES(text []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, errors.New("aes.NewCipher failure: " + err.Error())
	}
	if len(text) < aes.BlockSize {
		return nil, errors.New("ciphertext too short")
	}
	iv := text[:aes.BlockSize]
	text = text[aes.BlockSize:]
	cfb := cipher.NewCFBDecrypter(block, iv)
	cfb.XORKeyStream(text, text)
	return DecodeBase64(text)
}

// EncodeBase64 is a convenience function to encode using StdEncoding.
func EncodeBase64(b []byte) []byte {
	return []byte(base64.StdEncoding.EncodeToString(b))
}

// EncodeBase64AsString is a convenience function to encode using StdEncoding.
/*
func EncodeBase64AsString(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}
*/

// DecodeBase64 is a convenience function to decode using StdEncoding.
func DecodeBase64(b []byte) ([]byte, error) {
	return base64.StdEncoding.DecodeString(string(b))
}
