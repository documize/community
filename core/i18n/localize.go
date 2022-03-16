package i18n

import (
	"embed"
	"encoding/json"
	"fmt"

	"github.com/documize/community/core/asset"

	"github.com/pkg/errors"
)

var localeMap map[string]map[string]string

// type translation struct {
// 	Key   string `json:"key"`
// 	Value string `json:"value"`
// }

// SupportedLocales returns array of locales.
func SupportedLocales() (locales []string) {
	locales = append(locales, "en-US")

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

		// translations := []translation{}

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
func Localize(locale, key string) (s string) {
	l, ok := localeMap[locale]
	if !ok {
		// fallback
		l = localeMap["en-US"]
	}

	s, ok = l[key]
	if !ok {
		// missing translation key is echo'ed back
		s = fmt.Sprintf("!! %s !!", key)
	}

	return
}
