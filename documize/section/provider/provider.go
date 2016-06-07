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

	"github.com/documize/community/wordsmith/log"
)

// sectionsMap is where individual sections register themselves.
var sectionsMap = make(map[string]Provider)

// TypeMeta details a "smart section" that represents a "page" in a document.
type TypeMeta struct {
	ID          string                                         `json:"id"`
	Order       int                                            `json:"order"`
	ContentType string                                         `json:"contentType"`
	Title       string                                         `json:"title"`
	Description string                                         `json:"description"`
	Preview     bool                                           `json:"preview"` // coming soon!
	Callback    func(http.ResponseWriter, *http.Request) error `json:"-"`
}

// Provider represents a 'page' in a document.
type Provider interface {
	Meta() TypeMeta                                 // Meta returns section details
	Command(w http.ResponseWriter, r *http.Request) // Command is general-purpose method that can return data to UI
	Render(config, data string) string              // Render converts section data into presentable HTML
	Refresh(config, data string) string             // Refresh returns latest data
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
func Command(section string, w http.ResponseWriter, r *http.Request) bool {
	s, ok := sectionsMap[section]
	if ok {
		s.Command(w, r)
	}
	return ok
}

// Callback passes parameters to the given section callback, the returned error indicates success.
func Callback(section string, w http.ResponseWriter, r *http.Request) error {
	s, ok := sectionsMap[section]
	if ok {
		if cb := s.Meta().Callback; cb != nil {
			return cb(w, r)
		}
	}
	return errors.New("section not found")
}

// Render runs that operation for the given section id, the returned bool indicates success.
func Render(section, config, data string) (string, bool) {
	s, ok := sectionsMap[section]
	if ok {
		return s.Render(config, data), true
	}
	return "", false
}

// Refresh returns the latest data for a section.
func Refresh(section, config, data string) (string, bool) {
	s, ok := sectionsMap[section]
	if ok {
		return s.Refresh(config, data), true
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
	log.IfErr(err)
}

// WriteString writes string tp HTTP response.
func WriteString(w http.ResponseWriter, data string) {
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte(data))
	log.IfErr(err)
}

// WriteEmpty returns just OK to HTTP response.
func WriteEmpty(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("{}"))
	log.IfErr(err)
}

// WriteMarshalError write JSON marshalling error to HTTP response.
func WriteMarshalError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'JSON marshal failed'}"))
	log.IfErr(err2)
	log.Error("JSON marshall failed", err)
}

// WriteMessage write string to HTTP response.
func WriteMessage(w http.ResponseWriter, section, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err := w.Write([]byte("{Message: " + msg + "}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Error for section %s: %s", section, msg))
}

// WriteError write given error to HTTP response.
func WriteError(w http.ResponseWriter, section string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Internal server error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Error for section %s", section), err)
}

// WriteForbidden write 403 to HTTP response.
func WriteForbidden(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusForbidden)
	_, err := w.Write([]byte("{Error: 'Unauthorized'}"))
	log.IfErr(err)
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
