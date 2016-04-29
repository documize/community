package documize

import "strings"

const (
	errPfx = "{Error: '"
	errSfx = "'}"
)

func trimErrors(e string) string {
	return strings.TrimPrefix(strings.TrimSuffix(e, errSfx), errPfx)
}

func isError(e string) bool {
	return strings.HasPrefix(e, errPfx)
}
