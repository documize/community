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

package excerpt_test

import "testing"
import "github.com/documize/community/core/api/convert/excerpt"
import "strings"
import "fmt"

func TestExerpt(t *testing.T) {
	if excerpt.Excerpt(nil, nil) != "" ||
		excerpt.Excerpt([]string{}, []string{}) != "" {
		t.Error("empty lists do not return empty string")
	}
	qbf := strings.Split("The quick brown fox jumps over the lazy dog .", " ")
	qbf2 := qbf
	for i := 0; i < 200; i++ {
		qbf2 = append(qbf2, qbf...)
	}
	tst := excerpt.Excerpt(qbf, qbf2)
	if tst !=
		"The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog." {
		t.Error("'quick brown fox' did not work:", tst)
	}

	tt123 := strings.Split("Testing , testing ; 1 2 3 is fun ! Bracket [ anyone ? .", " ")
	tt123a := tt123
	for i := 0; i < 200; i++ {
		tt123a = append(tt123a, fmt.Sprintf("%d", i))
		tt123a = append(tt123a, tt123...)
	}
	tst2 := excerpt.Excerpt(tt123, tt123a)
	if tst2 !=
		"Testing, testing; 123 is fun! … Testing, testing; 123 is fun! … 0 Testing, testing; 123 is fun!" {
		t.Error("'Testing testing 123' did not work:", tst2)
	}

	s := strings.Split(strings.Replace(`
It's supercalifragilisticexpialidocious
Even though the sound of it is something quite atrocious
If you say it loud enough, you'll always sound precocious
Supercalifragilisticexpialidocious

Um diddle, diddle diddle, um diddle ay
Um diddle, diddle diddle, um diddle ay
Um diddle, diddle diddle, um diddle ay
Um diddle, diddle diddle, um diddle ay

Because I was afraid to speak
When I was just a lad
My father gave me nose a tweak
And told me I was bad

But then one day I learned a word
That saved me achin' nose
The biggest word I ever heard
And this is how it goes, oh

Supercalifragilisticexpialidocious
Even though the sound of it is something quite atrocious
If you say it loud enough, you'll always sound precocious
Supercalifragilisticexpialidocious

Um diddle, diddle diddle, um diddle ay
Um diddle, diddle diddle, um diddle ay
Um diddle, diddle diddle, um diddle ay
Um diddle, diddle diddle, um diddle ay

He traveled all around the world
And everywhere he went
He'd use his word and all would say
There goes a clever gent

When Dukes and Maharajahs
Pass the time of day with me
I say me special word
And then they ask me out to tea

Oh, supercalifragilisticexpialidocious
Even though the sound of it is something quite atrocious
If you say it loud enough, you'll always sound precocious
Supercalifragilisticexpialidocious

Um diddle, diddle diddle, um diddle ay
Um diddle, diddle diddle, um diddle ay

No, you can say it backwards, which is dociousaliexpilisticfragicalirupus
But that's going a bit too far, don't you think?

So when the cat has got your tongue
There's no need for dismay
Just summon up this word
And then you've got a lot to say

But better use it carefully
Or it could change your life
For example, yes, one night I said it to me girl
And now me girl's my wife, oh, and a lovely thing she's too

She's, supercalifragilisticexpialidocious
Supercalifragilisticexpialidocious
Supercalifragilisticexpialidocious
Supercalifragilisticexpialidocious
.	`, "\n", " . ", -1), " ")
	ts := []string{"Supercalifragilisticexpialidocious", "song", "lyrics"}
	st := excerpt.Excerpt(ts, s)
	if st != "Supercalifragilisticexpialidocious song lyrics. … Um diddle, diddle diddle, um diddle ay. Um diddle, diddle diddle, um diddle ay." {
		t.Error("'Supercalifragilisticexpialidocious song lyrics' did not work:", st)
	}

	ss := []string{"Supercalifragilisticexpialidocious", "!"}
	ssa := ss
	for i := 0; i < 100; i++ {
		ssa = append(ssa, ss...)
	}
	sst := excerpt.Excerpt(ss, ssa)
	if sst !=
		"Supercalifragilisticexpialidocious! Supercalifragilisticexpialidocious! Supercalifragilisticexpialidocious! Supercalifragilisticexpialidocious! Supercalifragilisticexpialidocious! Supercalifragilisticexpialidocious! Supercalifragilisticexpialidocious…" {
		t.Error("'Supercalifragilisticexpialidocious' did not work:", sst)
	}
}
