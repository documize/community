package utility

import "testing"

func TestBeautify(t *testing.T) {
	bs(t, "DooDah$day.zip", "Doo Dah Day")
}

func bs(t *testing.T, in, out string) {
	got := BeautifyFilename(in)
	if got != out {
		t.Errorf("BeautifyFilename input `%s` got `%s` expected `%s`\n", in, got, out)
	}
}
