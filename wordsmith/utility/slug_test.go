package utility

import "testing"

func TestSlug(t *testing.T) {
	st(t, " Zip--up ", "zip-up")
}

func st(t *testing.T, in, out string) {
	got := MakeSlug(in)
	if got != out {
		t.Errorf("slug input `%s` got `%s` expected `%s`\n", in, got, out)
	}
}
