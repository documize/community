package request

import "testing"
import "net/http"

func TestDomain(t *testing.T) {
	ds(t, "doodahday.documize.com", "doodahday", "doodahday")
	ds(t, "crud.com", "crud", "crud")
	ds(t, "badbadbad", "", "")
}

func ds(t *testing.T, in, out1, out2 string) {
	r, e := http.NewRequest("", in, nil)
	if e != nil {
		t.Fatal(e)
	}
	r.Host = in
	r.Header.Set("Referer", in)
	got1 := GetRequestSubdomain(r)
	out1 = CheckDomain(out1)
	if got1 != out1 {
		t.Errorf("GetRequestSubdomain input `%s` got `%s` expected `%s`\n", in, got1, out1)
	}
	got2 := GetSubdomainFromHost(r)
	out2 = CheckDomain(out2)
	if got2 != out2 {
		t.Errorf("GetSubdomainFromHost input `%s` got `%s` expected `%s`\n", in, got2, out2)
	}
}
