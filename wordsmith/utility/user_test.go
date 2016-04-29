package utility

import "testing"

func TestInitials(t *testing.T) {
	in(t, "Harvey", "Kandola", "HK")
	in(t, "Harvey", "", "H")
	in(t, "", "Kandola", "K")
	in(t, "", "", "")
}

func in(t *testing.T, firstname, lastname, expecting string) {
	initials := MakeInitials(firstname, lastname)
	if initials != expecting {
		t.Errorf("expecting initials of `%s` got `%s`\n", expecting, initials)
	}
}
