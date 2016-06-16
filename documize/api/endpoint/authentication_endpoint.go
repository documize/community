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
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"

	"github.com/documize/community/documize/api/endpoint/models"
	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/documize/api/util"
	"github.com/documize/community/documize/section/provider"
	"github.com/documize/community/wordsmith/environment"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"
)

// Authenticate user based up HTTP Authorization header.
// An encrypted authentication token is issued with an expiry date.
func Authenticate(w http.ResponseWriter, r *http.Request) {
	method := "Authenticate"
	p := request.GetPersister(r)

	authHeader := r.Header.Get("Authorization")

	// check for http header
	if len(authHeader) == 0 {
		writeBadRequestError(w, method, "Missing Authorization header")
		return
	}

	// decode what we received
	data := strings.Replace(authHeader, "Basic ", "", 1)
	decodedBytes, err := utility.DecodeBase64([]byte(data))

	if err != nil {
		writeBadRequestError(w, method, "Unable to decode authentication token")
		return
	}

	// check that we have domain:email:password (but allow for : in password field!)
	decoded := string(decodedBytes)
	credentials := strings.SplitN(decoded, ":", 3)

	if len(credentials) != 3 {
		writeBadRequestError(w, method, "Bad authentication token, expecting domain:email:password")
		return
	}

	domain := strings.TrimSpace(strings.ToLower(credentials[0]))
	domain = request.CheckDomain(domain) // TODO optimize by removing this once js allows empty domains
	email := strings.TrimSpace(strings.ToLower(credentials[1]))
	password := credentials[2]
	log.Info("logon attempt for " + domain + " @ " + email)

	user, err := p.GetUserByDomain(domain, email)

	if err == sql.ErrNoRows {
		writeUnauthorizedError(w)
		return
	}

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	if !user.Active || len(user.Reset) > 0 || len(user.Password) == 0 {
		writeUnauthorizedError(w)
		return
	}

	// Password correct and active user
	if email != strings.TrimSpace(strings.ToLower(user.Email)) || !util.MatchPassword(user.Password, password, user.Salt) {
		writeUnauthorizedError(w)
		return
	}

	org, err := p.GetOrganizationByDomain(domain)

	if err != nil {
		writeUnauthorizedError(w)
		return
	}

	// Attach user accounts and work out permissions
	attachUserAccounts(p, org.RefID, &user)

	if len(user.Accounts) == 0 {
		writeUnauthorizedError(w)
		return
	}

	authModel := models.AuthenticationModel{}
	authModel.Token = generateJWT(user.RefID, org.RefID, domain)
	authModel.User = user

	json, err := json.Marshal(authModel)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// Authorize secure API calls by inspecting authentication token.
// request.Context provides caller user information.
// Site meta sent back as HTTP custom headers.
func Authorize(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	method := "Authorize"

	// Let certain requests pass straight through
	authenticated := preAuthorizeStaticAssets(r)

	if !authenticated {
		token := findJWT(r)
		hasToken := len(token) > 1
		context, _, tokenErr := decodeJWT(token)

		var org = entity.Organization{}
		var err = errors.New("")

		// We always grab the org record regardless of token status.
		// Why? If bad token we might be OK to alow anonymous access
		// depending upon the domain in question.
		p := request.GetPersister(r)

		if len(context.OrgID) == 0 {
			org, err = p.GetOrganizationByDomain(request.GetRequestSubdomain(r))
		} else {
			org, err = p.GetOrganization(context.OrgID)
		}

		context.Subdomain = org.Domain

		// Inability to find org record spells the end of this request.
		if err != nil {
			writeForbiddenError(w)
			return
		}

		// If we have bad auth token and the domain does not allow anon access
		if !org.AllowAnonymousAccess && tokenErr != nil {
			writeUnauthorizedError(w)
			return
		}

		domain := request.GetSubdomainFromHost(r)

		if org.Domain != domain {
			writeUnauthorizedError(w)
			return
		}

		// If we have bad auth token and the domain allows anon access
		// then we generate guest context.
		if org.AllowAnonymousAccess {
			// So you have a bad token
			if hasToken {
				if tokenErr != nil {
					writeUnauthorizedError(w)
					return
				}
			} else {
				// Just grant anon user guest access
				context.UserID = "0"
				context.OrgID = org.RefID
				context.Authenticated = false
				context.Guest = true
			}
		}

		// Refresh context and persister
		request.SetContext(r, context)
		p = request.GetPersister(r)

		context.AllowAnonymousAccess = org.AllowAnonymousAccess
		context.OrgName = org.Title
		context.Administrator = false
		context.Editor = false

		// Fetch user permissions for this org
		if context.Authenticated {
			user, err := getSecuredUser(p, org.RefID, context.UserID)

			if err != nil {
				writeServerError(w, method, err)
				return
			}

			context.Administrator = user.Admin
			context.Editor = user.Editor
		}

		request.SetContext(r, context)
		p = request.GetPersister(r)

		// Middleware moves on if we say 'yes' -- autheticated or allow anon access.
		authenticated = context.Authenticated || org.AllowAnonymousAccess
	}

	if authenticated {
		next(w, r)
	} else {
		w.WriteHeader(http.StatusUnauthorized)
	}
}

// ValidateAuthToken checks the auth token and returns the corresponding user.
func ValidateAuthToken(w http.ResponseWriter, r *http.Request) {

	// TODO should this go after token validation?
	if s := r.URL.Query().Get("section"); s != "" {
		if err := provider.Callback(s, w, r); err != nil {
			log.Error("section validation failure", err)
			w.WriteHeader(http.StatusUnauthorized)
		}
		return
	}

	method := "ValidateAuthToken"

	context, claims, err := decodeJWT(findJWT(r))

	if err != nil {
		log.Error("token validation", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	request.SetContext(r, context)
	p := request.GetPersister(r)

	org, err := p.GetOrganization(context.OrgID)

	if err != nil {
		log.Error("token validation", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	domain := request.GetSubdomainFromHost(r)

	if org.Domain != domain || claims["domain"] != domain {
		log.Error("token validation", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	user, err := getSecuredUser(p, context.OrgID, context.UserID)

	if err != nil {
		log.Error("get user error for token validation", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	json, err := json.Marshal(user)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// Certain assets/URL do not require authentication.
// Just stops the log files being clogged up with failed auth errors.
func preAuthorizeStaticAssets(r *http.Request) bool {
	if strings.ToLower(r.URL.Path) == "/" ||
		strings.ToLower(r.URL.Path) == "/validate" ||
		strings.ToLower(r.URL.Path) == "/favicon.ico" ||
		strings.ToLower(r.URL.Path) == "/robots.txt" ||
		strings.ToLower(r.URL.Path) == "/version" ||
		strings.HasPrefix(strings.ToLower(r.URL.Path), "/api/public/") {

		return true
	}

	return false
}

var jwtKey string

func init() {
	environment.GetString(&jwtKey, "salt", false, "the salt string used to encode JWT tokens, if not set a random value will be generated",
		func(t *string, n string) bool {
			if jwtKey == "" {
				b := make([]byte, 17)
				_, err := rand.Read(b)
				if err != nil {
					jwtKey = err.Error()
					log.Error("problem using crypto/rand", err)
					return false
				}
				for k, v := range b {
					if (v >= 'a' && v <= 'z') || (v >= 'A' && v <= 'Z') || (v >= '0' && v <= '0') {
						b[k] = v
					} else {
						s := fmt.Sprintf("%x", v)
						b[k] = s[0]
					}
				}
				jwtKey = string(b)
				log.Info("Please set DOCUMIZESALT or use -salt with this value: " + jwtKey)
			}
			return true
		})
}

// Generates JSON Web Token (http://jwt.io)
func generateJWT(user, org, domain string) string {
	token := jwt.New(jwt.SigningMethodHS256)

	// issuer
	token.Claims["iss"] = "Documize"
	// subject
	token.Claims["sub"] = "webapp"
	// expiry
	token.Claims["exp"] = time.Now().Add(time.Hour * 168).Unix()
	// data
	token.Claims["user"] = user
	token.Claims["org"] = org
	token.Claims["domain"] = domain

	tokenString, _ := token.SignedString([]byte(jwtKey))

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
func decodeJWT(tokenString string) (c request.Context, claims map[string]interface{}, err error) {
	method := "decodeJWT"

	// sensible defaults
	c.UserID = ""
	c.OrgID = ""
	c.Authenticated = false
	c.Guest = false

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
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
	c.UserID = token.Claims["user"].(string)
	c.OrgID = token.Claims["org"].(string)

	if len(c.UserID) == 0 || len(c.OrgID) == 0 {
		err = fmt.Errorf("%s : unable parse token data", method)
		return
	}

	c.Authenticated = true
	c.Guest = false

	return c, token.Claims, nil
}
