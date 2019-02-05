package conversion

import (
	"testing"
)

// TestFilename validates filename extraction from path
func TestFilename(t *testing.T) {
	fn := "/var/folders/vx/lyhy36cn5kl994qj0pt6hgb80000gp/T/documize/_uploads/970f9d07-9bea-48a2-4333-b3c50bca42cd/Demo.docx"
	t.Run("Test filename "+fn, func(t *testing.T) {
		f := GetDocumentNameFromFilename(fn)
		if f != "Demo" {
			t.Error("Expected Demo, got " + f)
		}
		t.Log(f)
	})

	fn = "/var/Demo Docs.docx"
	t.Run("Test filename "+fn, func(t *testing.T) {
		f := GetDocumentNameFromFilename(fn)
		if f != "Demo Docs" {
			t.Error("Expected Demo Docs, got " + f)
		}
		t.Log(f)
	})

	fn = "Demo Docs.docx"
	t.Run("Test filename "+fn, func(t *testing.T) {
		f := GetDocumentNameFromFilename(fn)
		if f != "Demo Docs" {
			t.Error("Expected Demo Docs, got " + f)
		}
		t.Log(f)
	})

	fn = "/DemoDocs.docx"
	t.Run("Test filename "+fn, func(t *testing.T) {
		f := GetDocumentNameFromFilename(fn)
		if f != "DemoDocs" {
			t.Error("Expected DemoDocs, got " + f)
		}
		t.Log(f)
	})

	fn = "a\\b\\c\\DemoDocs.docx.ppt"
	t.Run("Test filename "+fn, func(t *testing.T) {
		f := GetDocumentNameFromFilename(fn)
		if f != "DemoDocs.docx" {
			t.Error("Expected DemoDocs.docx, got " + f)
		}
		t.Log(f)
	})
}
