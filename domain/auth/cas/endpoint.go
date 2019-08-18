package cas

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/store"
	usr "github.com/documize/community/domain/user"
	ath "github.com/documize/community/model/auth"
	"github.com/documize/community/model/user"
	casv2 "gopkg.in/cas.v2"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Authenticate checks CAS authentication credentials.
func (h *Handler) Authenticate(w http.ResponseWriter, r *http.Request) {
	method := "authenticate"
	ctx := domain.GetRequestContext(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		h.Runtime.Log.Error(method, err)
		return
	}

	a := ath.CASAuthRequest{}
	err = json.Unmarshal(body, &a)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}
	a.Ticket = strings.TrimSpace(a.Ticket)

	org, err := h.Store.Organization.GetOrganizationByDomain("")
	if err != nil {
		response.WriteUnauthorizedError(w)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.OrgID = org.RefID
	// Fetch CAS auth provider config
	ac := ath.CASConfig{}
	err = json.Unmarshal([]byte(org.AuthConfig), &ac)
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to unmarshal CAS configuration")
		h.Runtime.Log.Error(method, err)
		return
	}
	service := url.QueryEscape(ac.RedirectURL)

	validateURL := ac.URL + "/serviceValidate?ticket=" + a.Ticket + "&service=" + service

	resp, err := http.Get(validateURL)
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to get service validate url")
		h.Runtime.Log.Error(method, err)
		return
	}
	defer streamutil.Close(resp.Body)
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to verify CAS ticket: "+a.Ticket)
		h.Runtime.Log.Error(method, err)
		return
	}
	userInfo, err := casv2.ParseServiceResponse(data)
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to get user information")
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Runtime.Log.Info("cas logon attempt " + userInfo.User)

	u, err := h.Store.User.GetByDomain(ctx, a.Domain, userInfo.User)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Create user account if not found
	if err == sql.ErrNoRows {
		h.Runtime.Log.Info("cas add user " + userInfo.User + " @ " + a.Domain)

		u = user.User{}

		u.Active = true
		u.ViewUsers = false
		u.Analytics = false
		u.Admin = false
		u.GlobalAdmin = false
		u.Email = userInfo.User

		fn := userInfo.Attributes.Get("first_name")
		ln := userInfo.Attributes.Get("last_name")
		if len(fn) > 0 || len(ln) > 0 {
			u.Initials = stringutil.MakeInitials(fn, ln)
			u.Firstname = fn
			u.Lastname = ln
		} else {
			u.Initials = stringutil.MakeInitials(userInfo.User, "")
			u.Firstname = userInfo.User
			u.Lastname = ""
		}

		u.Salt = secrets.GenerateSalt()
		u.Password = secrets.GeneratePassword(secrets.GenerateRandomPassword(), u.Salt)

		u, err = auth.AddExternalUser(ctx, h.Runtime, h.Store, u, true)
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Password correct and active user
	if userInfo.User != strings.TrimSpace(strings.ToLower(u.Email)) {
		response.WriteUnauthorizedError(w)
		return
	}

	// Attach user accounts and work out permissions.
	usr.AttachUserAccounts(ctx, *h.Store, org.RefID, &u)

	// No accounts signals data integrity problem
	// so we reject login request.
	if len(u.Accounts) == 0 {
		response.WriteUnauthorizedError(w)
		err = fmt.Errorf("no user accounts found for %s", u.Email)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Abort login request if account is disabled.
	for _, ac := range u.Accounts {
		if ac.OrgID == org.RefID {
			if ac.Active == false {
				response.WriteUnauthorizedError(w)
				err = fmt.Errorf("no ACTIVE user account found for %s", u.Email)
				h.Runtime.Log.Error(method, err)
				return
			}
			break
		}
	}

	// Generate JWT token
	authModel := ath.AuthenticationModel{}
	authModel.Token = auth.GenerateJWT(h.Runtime, u.RefID, org.RefID, a.Domain)
	authModel.User = u

	response.WriteJSON(w, authModel)
	return
}
