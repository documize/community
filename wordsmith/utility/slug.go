package utility

import (
	"strings"
	"unicode"
)

// MakeSlug creates a slug, suitable for use in a URL, from a string
func MakeSlug(str string) string {
	slg := strings.Map(
		func(r rune) rune { // individual mapping of runes into a format suitable for use in a URL
			r = unicode.ToLower(r)
			if unicode.IsLower(r) || unicode.IsDigit(r) {
				return r
			}
			return '-'
		}, str)
	slg = strings.NewReplacer("---", "-", "--", "-").Replace(slg)
	for strings.HasSuffix(slg, "-") {
		slg = strings.TrimSuffix(slg, "-")
	}
	for strings.HasPrefix(slg, "-") {
		slg = strings.TrimPrefix(slg, "-")
	}
	return slg
}
