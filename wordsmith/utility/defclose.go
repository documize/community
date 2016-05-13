package utility

import "io"
import "github.com/documize/community/wordsmith/log"

// Close is a convenience function to close an io.Closer, usually in a defer.
func Close(f io.Closer) {
	if f != nil && f != io.Closer(nil) {
		log.IfErr(f.Close())
	}
}
