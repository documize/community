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

package endpoint

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/documize/community/core/api"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/log"
)

// var jwtKey string

// func init() {
// 	env.GetString(&jwtKey, "salt", false, "the salt string used to encode JWT tokens, if not set a random value will be generated",
// 		func(t *string, n string) bool {
// 			if jwtKey == "" {
// 				b := make([]byte, 17)
// 				_, err := rand.Read(b)
// 				if err != nil {
// 					jwtKey = err.Error()
// 					log.Error("problem using crypto/rand", err)
// 					return false
// 				}
// 				for k, v := range b {
// 					if (v >= 'a' && v <= 'z') || (v >= 'A' && v <= 'Z') || (v >= '0' && v <= '0') {
// 						b[k] = v
// 					} else {
// 						s := fmt.Sprintf("%x", v)
// 						b[k] = s[0]
// 					}
// 				}
// 				jwtKey = string(b)
// 				log.Info("Please set DOCUMIZESALT or use -salt with this value: " + jwtKey)
// 			}
// 			return true
// 		})
// }

// Generates JSON Web Token (http://jwt.io)
func generateJWT(user, org, domain string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss":    "Documize",
		"sub":    "webapp",
		"exp":    time.Now().Add(time.Hour * 168).Unix(),
		"user":   user,
		"org":    org,
		"domain": domain,
	})

	tokenString, _ := token.SignedString([]byte(api.Runtime.Flags.Salt))

	return tokenString
}

// Check for authorization token.
// We look for 'Authorization' request header OR query string "?token=XXX".
func findJWT(r *http.Request) (token string) {
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

// We take in raw token string and decode it.
func decodeJWT(tokenString string) (c request.Context, claims jwt.Claims, err error) {
	method := "decodeJWT"

	// sensible defaults
	c.UserID = ""
	c.OrgID = ""
	c.Authenticated = false
	c.Guest = false

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(api.Runtime.Flags.Salt), nil
	})

	if err != nil {
		err = fmt.Errorf("bad authorization token")
		return
	}

	if !token.Valid {
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorMalformed != 0 {
				log.Error("invalid token", err)
				err = fmt.Errorf("bad token")
				return
			} else if ve.Errors&(jwt.ValidationErrorExpired|jwt.ValidationErrorNotValidYet) != 0 {
				log.Error("expired token", err)
				err = fmt.Errorf("expired token")
				return
			} else {
				log.Error("invalid token", err)
				err = fmt.Errorf("bad token")
				return
			}
		} else {
			log.Error("invalid token", err)
			err = fmt.Errorf("bad token")
			return
		}
	}

	c = request.NewContext()

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		c.UserID = claims["user"].(string)
		c.OrgID = claims["org"].(string)
	} else {
		fmt.Println(err)
	}

	if len(c.UserID) == 0 || len(c.OrgID) == 0 {
		err = fmt.Errorf("%s : unable parse token data", method)
		return
	}

	c.Authenticated = true
	c.Guest = false

	return c, token.Claims, nil
}

// We take in Keycloak token string and decode it.
func decodeKeycloakJWT(t, pk string) (c jwt.MapClaims, err error) {
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
