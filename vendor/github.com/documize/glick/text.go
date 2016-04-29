package glick

import (
	"bytes"
	"errors"
	"io"
	"strings"
)

// ErrNotText not a simple text value held in string or []byte, or a pointer to them.
var ErrNotText = errors.New("interface value is not string or []byte, or pointer to string or []byte")

// IsText defines what can be a textual value,
// that is one of: string, *string, []byte or *[]byte.
func IsText(t interface{}) bool {
	switch t.(type) {
	case string, *string, []byte, *[]byte:
		return true
	}
	return false
}

// TextReader returns an io.Reader when given a textual value
// that is one of: string, *string, []byte or *[]byte.
func TextReader(t interface{}) (io.Reader, error) {
	switch t.(type) {
	case string:
		return strings.NewReader(t.(string)), nil
	case []byte:
		return bytes.NewReader(t.([]byte)), nil
	case *string:
		return strings.NewReader(*t.(*string)), nil
	case *[]byte:
		return bytes.NewReader(*t.(*[]byte)), nil
	default:
		return nil, ErrNotText
	}
}

// TextBytes returns a []byte when given a textual value
// that is one of: string, *string, []byte or *[]byte.
func TextBytes(t interface{}) ([]byte, error) {
	switch t.(type) {
	case string:
		return []byte(t.(string)), nil
	case []byte:
		return t.([]byte), nil
	case *string:
		return []byte(*t.(*string)), nil
	case *[]byte:
		return *t.(*[]byte), nil
	default:
		return nil, ErrNotText
	}
}

// TextConvert takes a []byte value and returs a new textual value
// of the same type as the model,
// that is one of: string, *string, []byte or *[]byte.
func TextConvert(b []byte, model interface{}) (interface{}, error) {
	switch model.(type) {
	case string:
		return string(b), nil
	case []byte:
		return b, nil
	case *string:
		s := string(b)
		return &s, nil
	case *[]byte:
		return &b, nil
	default:
		return nil, ErrNotText
	}
}
