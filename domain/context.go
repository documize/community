package domain

import (
	"fmt"
	"net/http"
	"time"

	"github.com/documize/community/core/env"
	"github.com/jmoiron/sqlx"
)

// RequestContext provides per request scoped values required
// by HTTP handlers.
type RequestContext struct {
	AllowAnonymousAccess bool
	Authenticated        bool
	Administrator        bool
	Guest                bool
	Editor               bool
	Global               bool
	UserID               string
	OrgID                string
	OrgName              string
	SSL                  bool
	AppURL               string // e.g. https://{url}.documize.com
	Subdomain            string
	ClientIP             string
	Expires              time.Time
	Fullname             string
	Transaction          *sqlx.Tx
}

//GetAppURL returns full HTTP url for the app
func (c *RequestContext) GetAppURL(endpoint string) string {
	scheme := "http://"

	if c.SSL {
		scheme = "https://"
	}

	return fmt.Sprintf("%s%s/%s", scheme, c.AppURL, endpoint)
}

type key string

// DocumizeContextKey prevents key name collisions.
const DocumizeContextKey key = "documize context key"

// GetRequestContext returns RequestContext from context.Context
func GetRequestContext(r *http.Request) RequestContext {
	return r.Context().Value(DocumizeContextKey).(RequestContext)
}

// StoreContext provides data persistence methods with runtime and request context.
type StoreContext struct {
	Runtime env.Runtime
	Context RequestContext
}

// NewContexts returns request scoped user context and store context for persistence logic.
func NewContexts(rt env.Runtime, r *http.Request) (RequestContext, StoreContext) {
	ctx := GetRequestContext(r)
	return ctx, StoreContext{Runtime: rt, Context: ctx}
}
