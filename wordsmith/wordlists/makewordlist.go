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

// Package main creates ordered lists of english words and their stems,
// based on their frequency.
package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"sort"

	"github.com/rookii/paicehusk"
)

type wordFreqEntry struct {
	rawFreq int
	Freq    float64
}

type wordFreqMap map[string]wordFreqEntry

type wordFreqSortEntry struct {
	Name string
	Freq float64
}
type wordFreqSort []wordFreqSortEntry

// Len is the number of elements in the collection.
func (wfs wordFreqSort) Len() int { return len(wfs) }

// Less reports whether the element with
// index i should sort before the element with index j.
func (wfs wordFreqSort) Less(i, j int) bool { return wfs[i].Freq > wfs[j].Freq }

// Swap swaps the elements with indexes i and j.
func (wfs wordFreqSort) Swap(i, j int) { wfs[j], wfs[i] = wfs[i], wfs[j] }

func main() {

	txt, err := ioutil.ReadFile("./en-2012/en.txt")
	if err != nil {
		panic(err)
	}

	lines := bytes.Split(txt, []byte("\n"))

	wfm := make(wordFreqMap)
	rfTot := 0
	for r, l := range lines {
		words := bytes.Split(l, []byte(" "))
		if len(words) >= 2 {
			var rf int
			_, err = fmt.Sscanf(string(words[1]), "%d", &rf)
			if err == nil && len(words[0]) > 0 {
				if r < 10000 { // only look at the most common 10k words, 100k makes go compile/link unworkable
					stem := string(words[0]) // NOTE not stemming at present
					entry, alredythere := wfm[stem]
					if alredythere {
						entry.rawFreq += rf
						wfm[stem] = entry
					} else {
						wfm[stem] = wordFreqEntry{rawFreq: rf, Freq: 0.0}
					}
				}
				rfTot += rf
			}
		}
	}
	for k, v := range wfm {
		v.Freq = float64(v.rawFreq) / float64(rfTot)
		wfm[k] = v
	}

	wfs := make(wordFreqSort, len(wfm))
	idx := 0
	for k, v := range wfm {
		wfs[idx].Name = k
		wfs[idx].Freq = v.Freq
		idx++
	}
	sort.Sort(wfs)
	writeWords(wfs, wfm)
}

func writeWords(wfs wordFreqSort, wfm wordFreqMap) {
	var goprog bytes.Buffer
	var err error

	fmt.Fprintf(&goprog, `
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

// Package words was auto-generated !
// From base data at http://invokeit.wordpress.com/frequency-word-lists/ .
// The word stems were produced using github.com/rookii/paicehusk .
// DO NOT EDIT BY HAND.
package words

// Entry type describes the rank and frequency of a prarticular word.
type Entry struct {
	Rank    int      // Word Rank order, 1 most frequent.
	Freq    float64  // Word Frequency, a fraction, larger is more frequent. 
}

// Map type provides the Entry information for each word.
type Map map[string]Entry

// Words gives the Entry information on the most frequent words.
var Words = Map{
`)
	for i, v := range wfs {
		fmt.Fprintf(&goprog, "\t"+`"%s": Entry{Rank:%d,Freq:%g},`+"\n", v.Name, i+1, v.Freq)
	}
	fmt.Fprintf(&goprog, "}\n\n")

	sfm := make(map[string]float64)
	for k, v := range wfm {
		sfm[paicehusk.DefaultRules.Stem(k)] += v.Freq
	}
	fmt.Fprintf(&goprog, "// Stems gives the frequency of word-stems.\nvar Stems = map[string]float64{\n")
	for k, v := range sfm {
		fmt.Fprintf(&goprog, "\t"+`"%s": %g,`+"\n", k, v)
	}
	fmt.Fprintf(&goprog, "}\n\n")

	err = ioutil.WriteFile("./en-2012/englishwords.go", goprog.Bytes(), 0666)

	if err != nil {
		panic(err)
	}
}
