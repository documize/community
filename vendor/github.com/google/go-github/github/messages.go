// Copyright 2016 The go-github AUTHORS. All rights reserved.
//
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// This file provides functions for validating payloads from GitHub Webhooks.
// GitHub docs: https://developer.github.com/webhooks/securing/#validating-payloads-from-github

package github

import (
	"crypto/hmac"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"fmt"
	"hash"
	"io/ioutil"
	"net/http"
	"strings"
)

const (
	// sha1Prefix is the prefix used by GitHub before the HMAC hexdigest.
	sha1Prefix = "sha1"
	// sha256Prefix and sha512Prefix are provided for future compatibility.
	sha256Prefix = "sha256"
	sha512Prefix = "sha512"
	// signatureHeader is the GitHub header key used to pass the HMAC hexdigest.
	signatureHeader = "X-Hub-Signature"
)

// genMAC generates the HMAC signature for a message provided the secret key
// and hashFunc.
func genMAC(message, key []byte, hashFunc func() hash.Hash) []byte {
	mac := hmac.New(hashFunc, key)
	mac.Write(message)
	return mac.Sum(nil)
}

// checkMAC reports whether messageMAC is a valid HMAC tag for message.
func checkMAC(message, messageMAC, key []byte, hashFunc func() hash.Hash) bool {
	expectedMAC := genMAC(message, key, hashFunc)
	return hmac.Equal(messageMAC, expectedMAC)
}

// messageMAC returns the hex-decoded HMAC tag from the signature and its
// corresponding hash function.
func messageMAC(signature string) ([]byte, func() hash.Hash, error) {
	if signature == "" {
		return nil, nil, errors.New("missing signature")
	}
	sigParts := strings.SplitN(signature, "=", 2)
	if len(sigParts) != 2 {
		return nil, nil, fmt.Errorf("error parsing signature %q", signature)
	}

	var hashFunc func() hash.Hash
	switch sigParts[0] {
	case sha1Prefix:
		hashFunc = sha1.New
	case sha256Prefix:
		hashFunc = sha256.New
	case sha512Prefix:
		hashFunc = sha512.New
	default:
		return nil, nil, fmt.Errorf("unknown hash type prefix: %q", sigParts[0])
	}

	buf, err := hex.DecodeString(sigParts[1])
	if err != nil {
		return nil, nil, fmt.Errorf("error decoding signature %q: %v", signature, err)
	}
	return buf, hashFunc, nil
}

// ValidatePayload validates an incoming GitHub Webhook event request
// and returns the (JSON) payload.
// secretKey is the GitHub Webhook secret message.
//
// Example usage:
//
//     func (s *GitHubEventMonitor) ServeHTTP(w http.ResponseWriter, r *http.Request) {
//       payload, err := github.ValidatePayload(r, s.webhookSecretKey)
//       if err != nil { ... }
//       // Process payload...
//     }
//
func ValidatePayload(r *http.Request, secretKey []byte) (payload []byte, err error) {
	payload, err = ioutil.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}

	sig := r.Header.Get(signatureHeader)
	if err := validateSignature(sig, payload, secretKey); err != nil {
		return nil, err
	}
	return payload, nil
}

// validateSignature validates the signature for the given payload.
// signature is the GitHub hash signature delivered in the X-Hub-Signature header.
// payload is the JSON payload sent by GitHub Webhooks.
// secretKey is the GitHub Webhook secret message.
//
// GitHub docs: https://developer.github.com/webhooks/securing/#validating-payloads-from-github
func validateSignature(signature string, payload, secretKey []byte) error {
	messageMAC, hashFunc, err := messageMAC(signature)
	if err != nil {
		return err
	}
	if !checkMAC(payload, messageMAC, secretKey, hashFunc) {
		return errors.New("payload signature check failed")
	}
	return nil
}
