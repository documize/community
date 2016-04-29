package utility

import (
	"strings"
)

// MakeInitials returns user initials from firstname and lastname.
func MakeInitials(firstname, lastname string) string {
	firstname = strings.TrimSpace(firstname)
	lastname = strings.TrimSpace(lastname)
	a := ""
	b := ""

	if len(firstname) > 0 {
		a = firstname[:1]
	}

	if len(lastname) > 0 {
		b = lastname[:1]
	}

	return strings.ToUpper(a + b)
}
