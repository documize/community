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

package auth

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// GenerateJWT generates JSON Web Token (http://jwt.io)
func GenerateJWT(rt *env.Runtime, user, org, domain string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss":    "Documize",
		"sub":    "webapp",
		"exp":    time.Now().Add(time.Hour * 8760).Unix(),
		"user":   user,
		"org":    org,
		"domain": domain,
	})

	tokenString, _ := token.SignedString([]byte(rt.Flags.Salt))

	return tokenString
}

// FindJWT looks for 'Authorization' request header OR query string "?token=XXX".
func FindJWT(r *http.Request) (token string) {
	header := r.Header.Get("Authorization")

	if header != "" {
		header = strings.Replace(header, "Bearer ", "", 1)
	}

	if len(header) > 1 {
		token = header
	} else {
		query := r.URL.Query()
		token = query.Get("token")
	}

	if token == "null" {
		token = ""
	}

	return
}

// DecodeJWT decodes raw token.
func DecodeJWT(rt *env.Runtime, tokenString string) (c domain.RequestContext, claims jwt.Claims, err error) {
	// sensible defaults
	c.UserID = ""
	c.OrgID = ""
	c.Authenticated = false
	c.Guest = false

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(rt.Flags.Salt), nil
	})

	if err != nil {
		err = fmt.Errorf("bad authorization token")
		return
	}

	if !token.Valid {
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorMalformed != 0 {
				err = fmt.Errorf("bad token")
				return
			} else if ve.Errors&(jwt.ValidationErrorExpired|jwt.ValidationErrorNotValidYet) != 0 {
				err = fmt.Errorf("expired token")
				return
			} else {
				err = fmt.Errorf("bad token")
				return
			}
		} else {
			err = fmt.Errorf("bad token")
			return
		}
	}

	c = domain.RequestContext{}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		c.UserID = claims["user"].(string)
		c.OrgID = claims["org"].(string)
	} else {
		fmt.Println(err)
	}

	if len(c.UserID) == 0 || len(c.OrgID) == 0 {
		err = fmt.Errorf("unable parse token data")
		return
	}

	c.Authenticated = true
	c.Guest = false

	return c, token.Claims, nil
}

// DecodeKeycloakJWT takes in Keycloak token string and decodes it.
func DecodeKeycloakJWT(t, pk string) (c jwt.MapClaims, err error) {
	token, err := jwt.Parse(t, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return jwt.ParseRSAPublicKeyFromPEM([]byte(pk))
	})

	if c, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return c, nil
	}

	return nil, err
}
