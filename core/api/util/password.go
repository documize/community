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

package util

import (
	"crypto/rand"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"

	"github.com/documize/community/core/log"
)

// GenerateRandomPassword provides a string suitable for use as a password.
func GenerateRandomPassword() string {
	c := 5
	b := make([]byte, c)
	_, err := rand.Read(b)
	log.IfErr(err)
	return hex.EncodeToString(b)
}

// GenerateSalt provides a string suitable for use as a salt value.
func GenerateSalt() string {
	c := 20
	b := make([]byte, c)
	_, err := rand.Read(b)
	log.IfErr(err)
	return hex.EncodeToString(b)
}

// GeneratePassword returns a hashed password.
func GeneratePassword(password string, salt string) string {
	pwd := []byte(salt + password)

	// Hashing the password with the cost of 10
	hashedPassword, err := bcrypt.GenerateFromPassword(pwd, 10)

	if err != nil {
		log.Error("GeneratePassword failed", err)
	}

	return string(hashedPassword)
}

// MatchPassword copares a hashed password with a clear one.
func MatchPassword(hashedPassword string, password string, salt string) bool {
	pwd := []byte(salt + password)

	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), pwd)

	return err == nil
}
