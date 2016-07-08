// Test file for a Go implementation of the Paice/Husk Stemming algorithm:
// http://www.comp.lancs.ac.uk/computing/research/stemming/Links/paice.htm
// Copyright (c) 2012, Aaron Groves. All rights reserved.

package paicehusk

import (
	"testing"
)

// Mostly checking for the Y special cases
var consonanttests = []struct {
	word     string
	offset   int
	expected bool
}{
	{"THEY", 0, true},
	{"THEY", 1, true},
	{"THEY", 2, false},
	{"THEY", 3, true},
	{"YOKE", 0, true},
	{"synergy", 0, true},
	{"synergy", 1, false},
	{"synergy", 2, true},
	{"synergy", 3, false},
	{"synergy", 4, true},
	{"synergy", 5, true},
	{"synergy", 6, false},
	{"男孩boy", 2, true}, // Unicode tests, I hope...
	{"男孩boy", 3, false},
	{"男孩boy", 4, true},
}

func TestConsonant(t *testing.T) {
	for i, tt := range consonanttests {
		s := consonant([]rune(tt.word), tt.offset)
		if s != tt.expected {
			t.Errorf("%v. consonant([]rune(\"%v\"), %v) should be %v, got %v", i, tt.word, tt.offset, tt.expected, s)
		}
	}
}

func TestVowel(t *testing.T) {
	for i, tt := range consonanttests {
		s := vowel([]rune(tt.word), tt.offset)
		if s != !tt.expected {
			t.Errorf("%v. vowel([]rune(\"%v\"), %v) should be %v, got %v", i, tt.word, tt.offset, !tt.expected, s)
		}
	}
}

// Ensure strings are revered properly
var reversetests = []struct {
	in       string
	expected string
}{
	{"Hello", "olleH"},
	{"Here's a more complicated string to reverse.", ".esrever ot gnirts detacilpmoc erom a s'ereH"},
}

func TestReverse(t *testing.T) {
	for i, tt := range reversetests {
		s := reverse(tt.in)
		if s != tt.expected {
			t.Errorf("%v. reverse(\"%v\") should be %v, got %v", i, tt.in, tt.expected, s)
		}
	}
}

var ruletests = []struct {
	rule   string
	valid  bool
	suf    string
	intact bool
	num    int
	app    string
	cont   bool
}{
	{"ai*2.", true, "ai", true, 2, "", false},
	{"lib3j>", true, "lib", false, 3, "j", true},
	{"There's a rule here somewhere: afab*4fla>", true, "afab", true, 4, "fla", true},
	{"ab*2 .", false, "", false, 0, "", false},
	{"fire", false, "", false, 0, "", false},
	{"asfa __ falkjlk ?!@|..", false, "", false, 0, "", false},
}

// Ensure rules are validated correctly
func TestValidRule(t *testing.T) {
	for i, tt := range ruletests {
		_, ok := ValidRule(tt.rule)
		if ok != tt.valid {
			t.Errorf("%v. ValidRule(\"%v\") should be %v, got %v", i, tt.rule, tt.valid, ok)
		}
	}
}

func TestParseRule(t *testing.T) {
	for i, tt := range ruletests {
		r, ok := ParseRule(tt.rule)
		if ok != tt.valid {
			t.Errorf("%v. ParseRule(\"%v\") err should be %v, got %v", i, tt.rule, tt.valid, ok)
		} else if ok {
			if r.suf != tt.suf {
				t.Errorf("%v. r.suf should be \"%v\", got \"%v\"", i, tt.suf, r.suf)
			}
			if r.intact != tt.intact {
				t.Errorf("%v. r.intact should be \"%v\", got \"%v\"", i, tt.intact, r.intact)
			}
			if r.num != tt.num {
				t.Errorf("%v. r.num should be \"%v\", got \"%v\"", i, tt.num, r.num)
			}
			if r.app != tt.app {
				t.Errorf("%v. r.app should be \"%v\", got \"%v\"", i, tt.app, r.app)
			}
			if r.cont != tt.cont {
				t.Errorf("%v. r.cont should be \"%v\", got \"%v\"", i, tt.cont, r.cont)
			}
		}
	}
}

func TestNewRuleTable(t *testing.T) {
	f := []string{ruletests[0].rule, ruletests[1].rule, ruletests[2].rule, ruletests[3].rule, ruletests[4].rule, ruletests[5].rule}
	table := NewRuleTable(f)
	if len(table.Table) != 2 {
		t.Errorf("Error: len(table.Table) should be %v, got %v", 2, len(table.Table))
	}
	if len(table.Table["a"]) != 2 {
		t.Errorf("Error: len(table.Table[\"a\"]) should be %v, got %v", 2, len(table.Table))
	}
}

var validstemtests = []struct {
	stem  string
	valid bool
}{
	{"xvzf", false}, // No vowels
	{"fire", true},
	{"aa", false}, // No consonant
	{"ab", true},
	{"a", false},  // No consonant
	{"ba", false}, // A First letter consonant requires 3 letter stem
	{"baa", true},
	{"bba", true},
}

func TestValidStem(t *testing.T) {
	for i, tt := range validstemtests {
		ok := validStem(tt.stem)
		if ok != tt.valid {
			t.Errorf("%v. validStem(\"%v\") should be %v, got %v", i, tt.stem, tt.valid, ok)
		}
	}
}

var stemtests = []struct {
	in        string
	expecting string
}{
	{"at", "at"},             // To short
	{"rack", "rack"},         // No 'k' rules exist
	{"aaron", "aaron"},       // 'N' rules exist but no 'n', or 'no' rule
	{"splat", "splat"},       // Resulting stem has no vowels
	{"doat", "doat"},         // Resulting stem starts with a consonant but only has 2 letters
	{"eat", "eat"},           // Resulting stem starts with a vowel but has only 1 letter
	{"ikat", "ik"},           // Resulting stem starts with a vowel and has 2 letters
	{"foreseen", "foreseen"}, // Check Protect Rule
	{"Ariaan", "aria"},       // Check intact rule
	{"explosion", "explod"},  // Check replace rule
	{"complicate", "comply"}, // Check partial replacement
	{"EXPLOSION", "explod"},  // Check all caps
}

func TestStem(t *testing.T) {
	for i, tt := range stemtests {
		if test := DefaultRules.Stem(tt.in); test != tt.expecting {
			t.Errorf("%v. Error: stemming \"%v\", expected %v, got %v", i, tt.in, tt.expecting, test)
		}
	}
}
