package asset

import (
	"embed"
	"errors"
	"io"
	"io/fs"
	"mime"
	"net/http"
	"path"
	"path/filepath"
)

// GetPublicFileSystem
func GetPublicFileSystem(e embed.FS) (hfs http.FileSystem, err error) {
	fsys, err := fs.Sub(e, "static/public")
	if err != nil {
		return nil, errors.New("failed GetPublicFileSystem")
	}

	return http.FS(fsys), nil
}

// FetchStatic loads static asset from embed file system.
func FetchStatic(e embed.FS, filename string) (content, contentType string, err error) {
	data, err := e.ReadFile("static/" + filename)
	if err != nil {
		return
	}

	contentType = mime.TypeByExtension(filepath.Ext(filename))
	content = string(data)

	return
}

// FetchStaticDir returns filenames within specified directory
func FetchStaticDir(fs embed.FS, directory string) (files []string, err error) {
	entries, err := fs.ReadDir("static/" + directory)
	if err != nil {
		return
	}

	for i := range entries {
		if !entries[i].Type().IsDir() {
			files = append(files, entries[i].Name())
		}
	}

	return files, nil
}

// WriteStatic loads static asset from embed file system and writes to HTTP.
func WriteStatic(fs embed.FS, prefix, requestedPath string, w http.ResponseWriter) error {
	f, err := fs.Open(path.Join(prefix, requestedPath))
	if err != nil {
		return err
	}
	defer f.Close()

	stat, _ := f.Stat()
	if stat.IsDir() {
		return errors.New("cannot write static file")
	}

	contentType := mime.TypeByExtension(filepath.Ext(requestedPath))
	w.Header().Set("Content-Type", contentType)
	_, err = io.Copy(w, f)
	return err
}
