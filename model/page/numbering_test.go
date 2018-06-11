// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

package page

import (
	"testing"
)

func TestNumberize1(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 1, Sequence: 1000})
	pages = append(pages, Page{Level: 2, Sequence: 2000})
	pages = append(pages, Page{Level: 2, Sequence: 3000})
	pages = append(pages, Page{Level: 2, Sequence: 4000})
	pages = append(pages, Page{Level: 3, Sequence: 5000})
	pages = append(pages, Page{Level: 3, Sequence: 6000})
	pages = append(pages, Page{Level: 4, Sequence: 7000})
	pages = append(pages, Page{Level: 4, Sequence: 8000})
	pages = append(pages, Page{Level: 5, Sequence: 9000})
	pages = append(pages, Page{Level: 3, Sequence: 10000})
	pages = append(pages, Page{Level: 2, Sequence: 11000})

	Numberize(pages)

	expecting := []string{
		"1",
		"1.1",
		"1.2",
		"1.3",
		"1.3.1",
		"1.3.2",
		"1.3.2.1",
		"1.3.2.2",
		"1.3.2.2.1",
		"1.3.3",
		"1.4",
	}

	for i, p := range pages {
		if p.Numbering != expecting[i] {
			t.Errorf("(Test 1) Position %d: expecting %s got %s\n", i, expecting[i], p.Numbering)
		}
	}
}

func TestNumberize2(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 1, Sequence: 1000})
	pages = append(pages, Page{Level: 1, Sequence: 2000})
	pages = append(pages, Page{Level: 1, Sequence: 3000})
	pages = append(pages, Page{Level: 1, Sequence: 4000})
	pages = append(pages, Page{Level: 1, Sequence: 5000})
	pages = append(pages, Page{Level: 1, Sequence: 6000})

	Numberize(pages)

	expecting := []string{
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
	}

	for i, p := range pages {
		if p.Numbering != expecting[i] {
			t.Errorf("(Test 2) Position %d: expecting %s got %s\n", i, expecting[i], p.Numbering)
		}
	}
}

func TestNumberize3(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 0, Sequence: 1000})
	pages = append(pages, Page{Level: 1, Sequence: 2000})
	pages = append(pages, Page{Level: 2, Sequence: 3000})
	pages = append(pages, Page{Level: 3, Sequence: 4000})
	pages = append(pages, Page{Level: 4, Sequence: 4000})
	pages = append(pages, Page{Level: 1, Sequence: 5000})
	pages = append(pages, Page{Level: 2, Sequence: 6000})

	Numberize(pages)

	expecting := []string{
		"1",
		"2",
		"2.1",
		"2.1.1",
		"2.1.1.1",
		"3",
		"3.1",
	}

	for i, p := range pages {
		if p.Numbering != expecting[i] {
			t.Errorf("(Test 3) Position %d: expecting %s got %s\n", i, expecting[i], p.Numbering)
		}
	}
}

// Tests that numbering does not crash because of bad data
func TestNumberize4(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 0, Sequence: 1000})
	pages = append(pages, Page{Level: 1, Sequence: 2000})
	pages = append(pages, Page{Level: 1, Sequence: 3000})

	// corruption starts here with Level=3 instead of Level=2
	pages = append(pages, Page{Level: 3, Sequence: 4000})
	pages = append(pages, Page{Level: 4, Sequence: 4000})
	pages = append(pages, Page{Level: 1, Sequence: 5000})
	pages = append(pages, Page{Level: 2, Sequence: 6000})

	Numberize(pages)

	expecting := []string{
		"1",
		"2",
		"3",
		"3.1",
		"3.1.1",
		// data below cannot be processed due to corruption
		"",  // should be 4
		"1", // should be 5
	}

	for i, p := range pages {
		if p.Numbering != expecting[i] {
			t.Errorf("(Test 4) Position %d: expecting %s got %s\n", i, expecting[i], p.Numbering)
		}
	}
}

// Tests that numbering does not crash because of bad data
func TestNumberize5(t *testing.T) {
	pages := []Page{}

	// corruption starts at the top with sequence 0
	pages = append(pages, Page{Level: 2, Sequence: 0})
	pages = append(pages, Page{Level: 1, Sequence: 1})
	pages = append(pages, Page{Level: 2, Sequence: 4})
	pages = append(pages, Page{Level: 2, Sequence: 8})
	pages = append(pages, Page{Level: 2, Sequence: 16})

	Numberize(pages)

	expecting := []string{
		"1",
		"2",
		"2.1",
		"2.2",
		"2.3",
	}

	for i, p := range pages {
		if p.Numbering != expecting[i] {
			t.Errorf("(Test 4) Position %d: expecting %s got %s\n", i, expecting[i], p.Numbering)
		}
	}
}

// Tests that good level data is not messed with
func TestLevelize1(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 1, Sequence: 1000})
	pages = append(pages, Page{Level: 1, Sequence: 2000})
	pages = append(pages, Page{Level: 2, Sequence: 3000})
	pages = append(pages, Page{Level: 3, Sequence: 4000})
	pages = append(pages, Page{Level: 4, Sequence: 5000})
	pages = append(pages, Page{Level: 1, Sequence: 6000})
	pages = append(pages, Page{Level: 2, Sequence: 7000})

	Levelize(pages)

	expecting := []uint64{1, 1, 2, 3, 4, 1, 2}

	for i, p := range pages {
		if p.Level != expecting[i] {
			t.Errorf("(TestLevelize1) Position %d: expecting %d got %d (sequence: %f)\n", i+1, expecting[i], p.Level, p.Sequence)
		}
	}
}

// Tests that bad level data
func TestLevelize2(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 1, Sequence: 1000})
	pages = append(pages, Page{Level: 1, Sequence: 2000})
	pages = append(pages, Page{Level: 3, Sequence: 3000})
	pages = append(pages, Page{Level: 3, Sequence: 4000})
	pages = append(pages, Page{Level: 4, Sequence: 5000})
	pages = append(pages, Page{Level: 1, Sequence: 6000})
	pages = append(pages, Page{Level: 2, Sequence: 7000})

	Levelize(pages)

	expecting := []uint64{1, 1, 2, 2, 3, 1, 2}

	for i, p := range pages {
		if p.Level != expecting[i] {
			t.Errorf("(TestLevelize2) Position %d: expecting %d got %d (sequence: %f)\n", i+1, expecting[i], p.Level, p.Sequence)
		}
	}
}

func TestLevelize3(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 1, Sequence: 1000})
	pages = append(pages, Page{Level: 4, Sequence: 2000})
	pages = append(pages, Page{Level: 5, Sequence: 3000})

	Levelize(pages)

	expecting := []uint64{1, 2, 3}

	for i, p := range pages {
		if p.Level != expecting[i] {
			t.Errorf("(TestLevelize3) Position %d: expecting %d got %d (sequence: %f)\n", i+1, expecting[i], p.Level, p.Sequence)
		}
	}
}

func TestLevelize4(t *testing.T) {
	pages := []Page{}

	pages = append(pages, Page{Level: 1, Sequence: 1000})
	pages = append(pages, Page{Level: 4, Sequence: 2000})
	pages = append(pages, Page{Level: 5, Sequence: 3000})
	pages = append(pages, Page{Level: 5, Sequence: 4000})
	pages = append(pages, Page{Level: 6, Sequence: 5000})
	pages = append(pages, Page{Level: 6, Sequence: 6000})
	pages = append(pages, Page{Level: 2, Sequence: 7000})

	Levelize(pages)

	expecting := []uint64{1, 2, 3, 3, 4, 4, 2}

	for i, p := range pages {
		if p.Level != expecting[i] {
			t.Errorf("(TestLevelize4) Position %d: expecting %d got %d (sequence: %f)\n", i+1, expecting[i], p.Level, p.Sequence)
		}
	}
}

// go test github.com/documize/community/core/model -run TestNumberiz, 3, 4, 4, 2e
