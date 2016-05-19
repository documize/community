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

// Package excerpt provides basic functionality to create excerpts of text in English.
package excerpt

import (
	"sort"
	"strings"
	"unicode"
	"unicode/utf8"

	words "github.com/documize/community/wordsmith/wordlists/en-2012"

	"github.com/rookii/paicehusk"
)

type extractItem struct {
	sequence int
	score    float64
	count    int
	sentance string
}

type extractList []extractItem

// the Sort interface
// Len is the number of elements in the collection.
func (a extractList) Len() int { return len(a) }

// Less reports whether the element with
// index i should sort before the element with index j.
func (a extractList) Less(i, j int) bool {
	return (a[i].score / float64(a[i].count)) > (a[j].score / float64(a[j].count))
}

// Swap swaps the elements with indexes i and j.
func (a extractList) Swap(i, j int) { a[i], a[j] = a[j], a[i] }

type presentItem struct {
	sequence int
	text     string
}

type presentList []presentItem

// the Sort interface
// Len is the number of elements in the collection.
func (a presentList) Len() int { return len(a) }

// Less reports whether the element with
// index i should sort before the element with index j.
func (a presentList) Less(i, j int) bool {
	return a[i].sequence < a[j].sequence
}

// Swap swaps the elements with indexes i and j.
func (a presentList) Swap(i, j int) { a[i], a[j] = a[j], a[i] }

func addWd(sentance, wd string) (string, bool) {
	var isStop bool
	if len(sentance) == 0 {
		if wd != "[" {
			sentance = wd
		}
	} else {
		switch wd {
		case "[": //NoOp
		case "0", "1", "2", "3", "4", "5", "6", "7", "8", "9":
			if unicode.IsDigit(rune(sentance[len(sentance)-1])) {
				sentance += wd
			} else {
				sentance += " " + wd
			}
		case ".", "!", "?":
			isStop = true
			fallthrough
		default:
			if isPunct(wd) {
				sentance += wd
			} else {
				sentance += " " + wd
			}
		}
	}
	return sentance, isStop
}

func isPunct(s string) bool {
	for _, r := range s {
		if !unicode.IsPunct(r) {
			switch r {
			case '`', '\'', '"', '(', '/': // still punct
			default:
				return false
			}
		}
	}
	return true
}

// Excerpt returns the most statically significant 100 or so words of text for use in the Excerpt field
func Excerpt(titleWords, bodyWords []string) string {
	var el extractList

	//fmt.Println("DEBUG Excerpt ", len(titleWords), len(bodyWords))

	// populate stemMap
	stemMap := make(map[string]uint64)
	for _, wd := range bodyWords {
		stem := paicehusk.DefaultRules.Stem(wd) // find the stem of the word
		stemMap[stem]++
	}
	for _, wd := range titleWords {
		stem := paicehusk.DefaultRules.Stem(wd) // find the stem of the word
		stemMap[stem]++                         // TODO are words in titles more important?
	}

	wds := append(titleWords, bodyWords...)

	sentance := ""
	score := 0.0
	count := 0
	seq := 0
	for _, wd := range wds {
		var isStop bool

		sentance, isStop = addWd(sentance, wd)

		if isStop {
			//fmt.Printf(" DEBUG sentance: %3d %3.2f %s\n",
			//	seq, score*10000/float64(count), sentance)
			var ei extractItem
			ei.count = count + 1 // must be at least 1
			ei.score = score
			ei.sentance = sentance
			ei.sequence = seq
			el = append(el, ei)
			sentance = ""
			score = 0.0
			seq++
		} else {
			uncommon := true
			// TODO Discuss correct level or maybe find a better algorithem for this
			ent, ok := words.Words[wd]
			if ok {
				if ent.Rank <= 100 {
					// do not score very common words
					uncommon = false
				}
			}
			if uncommon {
				stem := paicehusk.DefaultRules.Stem(wd) // find the stem of the word
				usage, used := stemMap[stem]
				if used {
					relativeStemFreq := (float64(usage) / float64(len(wds))) - words.Stems[stem]
					if relativeStemFreq > 0.0 {
						score += relativeStemFreq
					}
				}
				count++
			}
		}
	}

	sort.Sort(el)

	return present(el)
}

func present(el extractList) (ret string) {
	var pl presentList
	words := 0

	const excerptWords = 50

	for s, e := range el {
		if (words < excerptWords || s == 0) && len(e.sentance) > 1 &&
			notEmpty(e.sentance) {
			words += e.count
			pl = append(pl, presentItem{sequence: e.sequence, text: e.sentance})
			//fmt.Printf("DEBUG With score %3.2f on page %d // %s \n",
			//	1000*e.score/float64(e.count), e.sequence, e.sentance)
		}
	}
	sort.Sort(pl)

	var lastSeq int
	for p := range pl {
		txt := strings.TrimPrefix(pl[p].text, ". ")
		if p == 0 {
			ret = txt
			lastSeq = pl[0].sequence
		} else {
			thisSeq := pl[p].sequence
			if lastSeq+1 != thisSeq {
				ret += " …" // Horizontal elipsis character
			}
			ret += " " + txt
			lastSeq = thisSeq
		}
	}
	if len(ret) > 250 { // make sure the excerpt is not too long, shorten it if required
		for len(ret) > 250 {
			_, size := utf8.DecodeLastRuneInString(ret)
			ret = ret[:len(ret)-size]
		}
		return ret + "…" // Horizontal elipsis character added after truncation
	}
	return ret
}

func notEmpty(wds string) bool {
	for _, r := range wds {
		if !unicode.IsPunct(r) && !unicode.IsSpace(r) {
			return true
		}
	}
	return false
}
