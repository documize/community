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

package provider

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
)

// SecretReplacement is a constant used to replace secrets in data-structures when required.
// 8 stars.
const SecretReplacement = "********"

// sectionsMap is where individual sections register themselves.
var sectionsMap = make(map[string]Provider)

// TypeMeta details a "smart section" that represents a "page" in a document.
type TypeMeta struct {
	ID          string                                                                     `json:"id"`
	Order       int                                                                        `json:"order"`
	ContentType string                                                                     `json:"contentType"`
	PageType    string                                                                     `json:"pageType"`
	Title       string                                                                     `json:"title"`
	Description string                                                                     `json:"description"`
	Retired     bool                                                                       `json:"retired"` // no new inserts of this type, just edits
	Preview     bool                                                                       `json:"preview"` // coming soon!
	Callback    func(*env.Runtime, *store.Store, http.ResponseWriter, *http.Request) error `json:"-"`
}

// ConfigHandle returns the key name for database config table
func (t *TypeMeta) ConfigHandle() string {
	return fmt.Sprintf("SECTION-%s", strings.ToUpper(t.ContentType))
}

// Provider represents a 'page' in a document.
type Provider interface {
	Meta() TypeMeta                                               // Meta returns section details
	Command(ctx *Context, w http.ResponseWriter, r *http.Request) // Command is general-purpose method that can return data to UI
	Render(ctx *Context, config, data string) string              // Render converts section data into presentable HTML
	Refresh(ctx *Context, config, data string) string             // Refresh returns latest data
}

// Context describes the environment the section code runs in
type Context struct {
	OrgID     string
	UserID    string
	prov      Provider
	inCommand bool
	Request   domain.RequestContext
}

// NewContext is a convenience function.
func NewContext(orgid, userid string, ctx domain.RequestContext) *Context {
	return &Context{OrgID: orgid, UserID: userid, Request: ctx}
}

// Register makes document section type available
func Register(name string, p Provider) {
	sectionsMap[name] = p
}

// List returns available types
func List() map[string]Provider {
	return sectionsMap
}

// GetSectionMeta returns a list of smart sections.
func GetSectionMeta() []TypeMeta {
	sections := []TypeMeta{}

	for _, section := range sectionsMap {
		sections = append(sections, section.Meta())
	}

	return sortSections(sections)
}

// Command passes parameters to the given section id, the returned bool indicates success.
func Command(section string, ctx *Context, w http.ResponseWriter, r *http.Request) bool {
	s, ok := sectionsMap[section]
	if ok {
		ctx.prov = s
		ctx.inCommand = true
		s.Command(ctx, w, r)
	}
	return ok
}

// Callback passes parameters to the given section callback, the returned error indicates success.
func Callback(section string, rt *env.Runtime, store *store.Store, w http.ResponseWriter, r *http.Request) error {
	s, ok := sectionsMap[section]
	if ok {
		if cb := s.Meta().Callback; cb != nil {
			return cb(rt, store, w, r)
		}
	}
	return errors.New("section not found")
}

// Render runs that operation for the given section id, the returned bool indicates success.
func Render(section string, ctx *Context, config, data string) (string, bool) {
	s, ok := sectionsMap[section]
	if ok {
		ctx.prov = s
		return s.Render(ctx, config, data), true
	}
	return "", false
}

// Refresh returns the latest data for a section.
func Refresh(section string, ctx *Context, config, data string) (string, bool) {
	s, ok := sectionsMap[section]
	if ok {
		ctx.prov = s
		return s.Refresh(ctx, config, data), true
	}
	return "", false
}

// WriteJSON writes data as JSON to HTTP response.
func WriteJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)

	j, err := json.Marshal(v)

	if err != nil {
		WriteMarshalError(w, err)
		return
	}

	_, err = w.Write(j)
}

// WriteString writes string tp HTTP response.
func WriteString(w http.ResponseWriter, data string) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(data))
}

// WriteEmpty returns just OK to HTTP response.
func WriteEmpty(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{}"))
}

// WriteMarshalError write JSON marshalling error to HTTP response.
func WriteMarshalError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("{Error: 'JSON marshal failed'}"))
}

// WriteMessage write string to HTTP response.
func WriteMessage(w http.ResponseWriter, section, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("{Message: " + msg + "}"))
}

// WriteError write given error to HTTP response.
func WriteError(w http.ResponseWriter, section string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("{Error: 'Internal server error'}"))
}

// WriteForbidden write 403 to HTTP response.
func WriteForbidden(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusForbidden)
	w.Write([]byte("{Error: 'Unauthorized'}"))
}

// Secrets handling

// SaveSecrets for the current user/org combination.
// The secrets must be in the form of a JSON format string, for example `{"mysecret":"lover"}`.
// An empty string signifies no valid secrets for this user/org combination.
// Note that this function can only be called within the Command method of a section.
func (c *Context) SaveSecrets(JSONobj string, s *store.Store) error {
	if !c.inCommand {
		return errors.New("SaveSecrets() may only be called from within Command()")
	}
	m := c.prov.Meta()
	return s.Setting.SetUser(c.OrgID, c.UserID, m.ContentType, JSONobj)
}

// MarshalSecrets to the database.
// Parameter the same as for json.Marshal().
func (c *Context) MarshalSecrets(sec interface{}, s *store.Store) error {
	if !c.inCommand {
		return errors.New("MarshalSecrets() may only be called from within Command()")
	}
	byts, err := json.Marshal(sec)
	if err != nil {
		return err
	}
	return c.SaveSecrets(string(byts), s)
}

// GetSecrets for the current context user/org.
// For example (see SaveSecrets example): thisContext.GetSecrets("mysecret")
// JSONpath format is defined at https://dev.mysql.com/doc/refman/5.7/en/json-path-syntax.html .
// An empty JSONpath returns the whole JSON object, as JSON.
// Errors return the empty string.
func (c *Context) GetSecrets(JSONpath string, s *store.Store) string {
	m := c.prov.Meta()
	v, _ := s.Setting.GetUser(c.OrgID, c.UserID, m.ContentType, JSONpath)

	return v
}

// ErrNoSecrets is returned if no secret is found in the database.
var ErrNoSecrets = errors.New("no secrets in database")

// UnmarshalSecrets from the database.
// Parameter the same as for "v" in json.Unmarshal().
func (c *Context) UnmarshalSecrets(v interface{}, s *store.Store) error {
	secTxt := c.GetSecrets("", s) // get all the json of the secrets
	if len(secTxt) > 0 {
		return json.Unmarshal([]byte(secTxt), v)
	}
	return ErrNoSecrets
}

// sort sections in order that that should be presented.
type sectionsToSort []TypeMeta

func (s sectionsToSort) Len() int      { return len(s) }
func (s sectionsToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s sectionsToSort) Less(i, j int) bool {
	if s[i].Order == s[j].Order {
		return s[i].Title < s[j].Title
	}
	return s[i].Order > s[j].Order
}

func sortSections(in []TypeMeta) []TypeMeta {
	sts := sectionsToSort(in)
	sort.Sort(sts)
	return []TypeMeta(sts)
}
