// +build gofuzz

package htmldiff

import (
	"strings"
	"unicode/utf8"

	"golang.org/x/net/html"
)

type fuzzCfg struct {
	cfg *Config
	cmp []string
}

func baseFuzzCfg() *fuzzCfg {
	return &fuzzCfg{
		cfg: &Config{
			Granularity:  0,
			InsertedSpan: []html.Attribute{{Key: "style", Val: "background-color: palegreen; text-decoration: underline;"}},
			DeletedSpan:  []html.Attribute{{Key: "style", Val: "background-color: lightpink; text-decoration: line-through;"}},
			ReplacedSpan: []html.Attribute{{Key: "style", Val: "background-color: lightskyblue; text-decoration: overline;"}},
			CleanTags:    nil,
		},
	}
}

type fuzzer func(*fuzzCfg, []byte, uint)

var fuzzers = []fuzzer{fuz0, fuz1, fuz2, fuz3, fuz4, fuz5, fuz6 /*, fuz7 */}

// Fuzz is the test function for https://github.com/dvyukov/go-fuzz
func Fuzz(data []byte) int {
	fcfg := baseFuzzCfg()
	seed := uint1(&data)
	fuzzers[int(seed)%len(fuzzers)](fcfg, data, seed/uint(len(fuzzers)))
	if _, err := fcfg.cfg.HTMLdiff(fcfg.cmp); err != nil {
		return 0
	}
	return 1
}

func fuz0(fcfg *fuzzCfg, data []byte, seed uint) {
	raw := string(data)
	var x0, x1 string
	for i, r := range raw {
		if r != utf8.RuneError {
			x0 += string(r)
			switch i % 4 {
			case 0:
			case 1:
				x1 += string(r)
				x1 += string(r)
			default:
				x1 += string(r)
			}
		}
	}
	fcfg.cmp = []string{x0, x1}
}

func fuz1(fcfg *fuzzCfg, data []byte, seed uint) {
	fcfg.cfg.Granularity = int(seed)
	fcfg.cmp = []string{string(data), strings.ToUpper(string(data))}
}

func fuz2(fcfg *fuzzCfg, data []byte, seed uint) {
	fcfg.cfg.Granularity = int(seed)
	for ct := int(seed) / 2; ct > 0; ct-- {
		fcfg.cfg.CleanTags = append(fcfg.cfg.CleanTags, str5(&data))
	}
	n := int(seed) + 1
	h := make([]string, 0, n)
	xx := ""
	l := len(data) / int(n)
	for n--; n >= 0; n-- {
		x := strMax(&data, l)
		h = append(h, x)
		if len(x) > 0 {
			xx = x
		}
	}
	fcfg.cmp = append([]string{xx}, h...)
}

func fuz3(fcfg *fuzzCfg, data []byte, seed uint) {
	fcfg.cfg.Granularity = int(seed)
	raw := string(data)
	var x0, x1 string
	for i, r := range raw {
		if r != utf8.RuneError {
			x0 += string(r)
			switch i % 2 {
			case 0:
				x0 += string(r)
			case 1:
				x1 += string(r)
			}
		}
	}
	fcfg.cmp = []string{x0, x1}
}

func fuz4(fcfg *fuzzCfg, data []byte, seed uint) {
	raw := string(data)
	x, y := "", ""
	for _, r := range raw {
		if r != utf8.RuneError {
			x += string(r)
			y = string(r) + y
		}
	}
	fcfg.cfg.Granularity = len(x) % int(seed+1)
	fcfg.cmp = []string{x, y}
}

func fuz5(fcfg *fuzzCfg, data []byte, seed uint) {
	raw := string(data)
	x := ""
	for _, r := range raw {
		if r != utf8.RuneError {
			x += string(r)
		}
	}
	fcfg.cfg.Granularity = len(x) % int(seed+1)
	fcfg.cmp = []string{x, strings.ToLower(x)}
}

func fuz6(fcfg *fuzzCfg, data []byte, seed uint) {
	raw := string(data)
	x := ""
	for _, r := range raw {
		if r != utf8.RuneError {
			x += string(r)
		}
	}
	fcfg.cmp = []string{x, strings.ToTitle(x)}
}

/* file decode time is too long
func fuz7(fcfg *fuzzCfg, data []byte, seed uint) {
	dir := ".." + string(os.PathSeparator) + "testin" // should be running in the fuzz directory
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		return
	}
tryAgain:
	file := files[int(seed)%len(files)]
	baseHTML := ""
	fn := file.Name()
	var dat []byte
	if !strings.HasSuffix(fn, ".html") || fn == "google.html" {
		seed++
		goto tryAgain
	}
	ffn := dir + string(os.PathSeparator) + fn
	dat, err = ioutil.ReadFile(ffn)
	if err != nil {
		return
	}
	baseHTML = string(dat)

	ptr := (int(seed) + len(dat)/2) % len(dat)
	dat[ptr] = byte(seed) & 0x7f
	for x, xx := range dat {
		ptr = (ptr + x + int(xx)) % len(dat)
		dat[ptr] = xx & 0x7f
	}
	fcfg.cmp = []string{baseHTML, string(dat)}
}
*/

func uint1(data *[]byte) uint {
	if len(*data) < 1 {
		return 0
	}
	r := (*data)[0]
	*data = (*data)[1:]
	return uint(r)
}

func str5(data *[]byte) string {
	if len(*data) < 1 {
		return ""
	}
	l := int((*data)[0])%5 + 1
	if len(*data) <= l {
		return ""
	}
	raw := string((*data)[1 : l+1])
	*data = (*data)[l:]
	s := ""
	for _, r := range raw {
		if r != utf8.RuneError {
			s += string(r)
		}
	}
	return s
}

var tags = []string{"u", "p", "i", "b", "div"}

func strMax(data *[]byte, limit int) string {
	s := ""
	for max := limit; len(s) < limit && max > 0; max-- {
		txt := str5(data)
		tag := tags[uint1(data)%uint(len(tags))]
		s += "<" + tag + ">" + txt + "</" + tag + ">"
	}
	return s
}
