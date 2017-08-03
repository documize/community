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

package secrets

import (
	"crypto/rand"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

// GenerateRandomPassword provides a string suitable for use as a password.
func GenerateRandomPassword() string {
	return GenerateRandom(5)
}

// GenerateSalt provides a string suitable for use as a salt value.
func GenerateSalt() string {
	return GenerateRandom(20)
}

// GenerateRandom returns a string of the specified length using crypo/rand
func GenerateRandom(size int) string {
	b := make([]byte, size)
	rand.Read(b)

	return hex.EncodeToString(b)
}

// GeneratePassword returns a hashed password.
func GeneratePassword(password string, salt string) string {
	pwd := []byte(salt + password)

	// Hashing the password with the cost of 10
	hashedPassword, _ := bcrypt.GenerateFromPassword(pwd, 10)

	return string(hashedPassword)
}

// MatchPassword copares a hashed password with a clear one.
func MatchPassword(hashedPassword string, password string, salt string) bool {
	pwd := []byte(salt + password)

	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), pwd)

	return err == nil
}
