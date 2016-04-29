package api

// ConversionJobRequest is the information used to set-up a conversion job.
type ConversionJobRequest struct {
	Job        string
	IndexDepth uint
	OrgID      string
}

// DocumentExport is the type used by a document export plugin.
type DocumentExport struct {
	Filename string
	Format   string
	File     []byte
}
