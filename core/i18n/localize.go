package i18n

import (
	"embed"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/documize/community/core/asset"

	"github.com/pkg/errors"
)

const (
	DefaultLocale = "en-US"
)

var localeMap map[string]map[string]string

// SupportedLocales returns array of locales.
func SupportedLocales() (locales []string) {
	locales = append(locales, "en-US")
	locales = append(locales, "de-DE")
	locales = append(locales, "zh-CN")
	locales = append(locales, "pt-BR")
	locales = append(locales, "fr-FR")
	locales = append(locales, "ja-JP")

	return
}

// Intialize will load language files
func Initialize(e embed.FS) (err error) {
	localeMap = make(map[string]map[string]string)

	locales := SupportedLocales()

	for i := range locales {
		content, _, err := asset.FetchStatic(e, "i18n/"+locales[i]+".json")
		if err != nil {
			err = errors.Wrap(err, fmt.Sprintf("missing locale %s", locales[i]))
			return err
		}

		var payload interface{}
		json.Unmarshal([]byte(content), &payload)
		m := payload.(map[string]interface{})

		translations := make(map[string]string)

		for j := range m {
			translations[j] = m[j].(string)
		}

		localeMap[locales[i]] = translations
	}

	return nil
}

// Localize will returns string value for given key using specified locale).
// e.g. locale = "en-US", key = "admin_billing"
//
// Replacements are for replacing string placeholders ({1} {2} {3}) with
// replacement text.
// e.g. "This is {1} example"  --> replacements[0] will replace {1}
func Localize(locale string, key string, replacements ...string) (s string) {
	l, ok := localeMap[locale]
	if !ok {
		// fallback
		l = localeMap[DefaultLocale]
	}

	s, ok = l[key]
	if !ok {
		// missing translation key is echo'ed back
		s = fmt.Sprintf("!! %s !!", key)
	}

	// placeholders are one-based: {1} {2} {3}
	// replacements array is zero-based hence the +1 below
	if len(replacements) > 0 {
		for i := range replacements {
			s = strings.Replace(s, fmt.Sprintf("{%d}", i+1), replacements[i], 1)
		}
	}

	return
}
