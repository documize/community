package utility

import "testing"

func TestSecrets(t *testing.T) {
	mimi := "007"
	b, e := MakeAES(mimi)
	if e != nil {
		t.Fatal(e)
	}
	mm, e2 := DecryptAES(b)
	if e2 != nil {
		t.Fatal(e2)
	}
	if mimi != string(mm) {
		t.Errorf("wanted %s got %s", mimi, string(mm))
	}
	
	_, ee := DecryptAES([]byte{})
	if ee == nil {
		t.Error("should have errored on empty cypher")
	}
	
}
