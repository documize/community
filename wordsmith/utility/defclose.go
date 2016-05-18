package utility

import "io"
import "github.com/documize/community/wordsmith/log"

// Close is a convenience function to close an io.Closer, usually in a defer.
func Close(f interface{}) {
	if f != nil {
		if ff, ok := f.(io.Closer); ok {
			if ff != io.Closer(nil) {
				log.IfErr(ff.Close())
			}
		}
	}
}
