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

package convert_test

import (
	"github.com/documize/community/documize/api/convert"
	"github.com/documize/community/documize/api/plugins"
	"github.com/documize/community/wordsmith/api"
	"github.com/documize/community/wordsmith/log"
	"strings"
	"testing"

	"golang.org/x/net/context"
)

func TestConvert(t *testing.T) {

	plugins.PluginFile = "" // no file as html is built-in
	if lerr := plugins.LibSetup(); lerr == nil {
		//t.Error("did not error on plugin.Libsetup() with no plugin.json file")
		//return
	}
	defer log.IfErr(plugins.Lib.KillSubProcs())

	ctx := context.Background()
	xtn := "html"
	fileRequest := new(api.DocumentConversionRequest)
	fileRequest.Filedata = []byte(yorkweb)
	resp, err := convert.Convert(ctx, xtn, fileRequest)
	if err != nil {
		t.Error(err)
		return
	}
	if len(resp.Pages) != 3 ||
		!strings.HasPrefix(resp.Pages[1].Title, "STARTING") ||
		!strings.HasPrefix(resp.Pages[2].Title, "EXERCISE") {
		for p, pg := range resp.Pages {
			t.Error(p, pg.Level, len(pg.Body), pg.Title)
		}
	}
	exp := "There are lots of ways to create web pages using already coded programmes. … HTML isn' t computer code, but is a language that uses US English to enable texts( words, images, sounds) to be inserted and formatting such as colo( u) r and centre/ erin…"
	if resp.Excerpt != exp {
		t.Errorf("unexpected excerpt wanted: `%s` got: `%s`", exp, resp.Excerpt)
	}

	// check errors are caught
	resp, err = convert.Convert(ctx, "unknown", fileRequest)
	if err == nil {
		t.Error("does not error on unknown extension")
	}

}

// www.york.ac.uk/teaching/cws/wws/webpage1.html
const yorkweb = `

<HMTL>
<HEAD>
<TITLE>webpage1</TITLE>
</HEAD>
<BODY BGCOLOR="FFFFFf" LINK="006666" ALINK="8B4513" VLINK="006666">
<TABLE WIDTH="75%" ALIGN="center">
<TR>
<TD>
<DIV ALIGN="center"><H1>STARTING . . . </H1></DIV>


<DIV ALIGN="justify"><P>There are lots of ways to create web pages using already coded programmes. These lessons will teach you how to use the underlying HyperText Markup Language -  HTML. 
<BR>
<P>HTML isn't computer code, but is a language that uses US English to enable texts (words, images, sounds) to be inserted and formatting such as colo(u)r and centre/ering to be written in. The process is fairly simple; the main difficulties often lie in small mistakes - if you slip up while word processing your reader may pick up your typos, but the page will still be legible. However, if your HTML is inaccurate the page may not appear - writing web pages is, at the least, very good practice for proof reading!</P>

<P>Learning HTML will enable you to:
<UL>
<LI>create your own simple pages
<LI>read and appreciate pages created by others
<LI>develop an understanding of the creative and literary implications of web-texts
<LI>have the confidence to branch out into more complex web design 
</UL></P>

<P>A HTML web page is made up of tags. Tags are placed in brackets like this <B>< tag > </B>. A tag tells the browser how to display information. Most tags need to be opened < tag > and closed < /tag >.

<P> To make a simple web page you need to know only four tags:
<UL>
<LI>< HTML > tells the browser your page is written in HTML format
<LI>< HEAD > this is a kind of preface of vital information that doesn't appear on the screen. 
<LI>< TITLE >Write the title of the web page here - this is the information that viewers see on the upper bar of their screen. (I've given this page the title 'webpage1').
<LI>< BODY >This is where you put the content of your page, the words and pictures that people read on the screen. 
</UL>
<P>All these tags need to be closed.

<H4>EXERCISE</H4>

<P>Write a simple web page.</P>
<P> Copy out exactly the HTML below, using a WP program such as Notepad.<BR>
Information in <I>italics</I> indicates where you can insert your own text, other information is HTML and needs to be exact. However, make sure there are no spaces between the tag brackets and the text inside.<BR>
(Find Notepad by going to the START menu\ PROGRAMS\ ACCESSORIES\ NOTEPAD). 
<P>
< HTML ><BR>
< HEAD ><BR>
< TITLE ><I> title of page</I>< /TITLE ><BR>
< /HEAD ><BR>
< BODY><BR>
<I> write what you like here: 'my first web page', or a piece about what you are reading, or a few thoughts on the course, or copy out a few words from a book or cornflake packet.  Just type in your words using no extras such as bold, or italics, as these have special HTML tags, although you may use upper and lower case letters and single spaces. </I><BR>

< /BODY ><BR>
< /HTML ><BR>

<P>Save the file as 'first.html' (ie. call the file anything at all) It's useful if you start a folder - just as you would for word-processing - and call it something like WEBPAGES, and put your first.html file in the folder.

<P>NOW - open your browser.<BR>
On Netscape the process is: <BR>  
Top menu; FILE\ OPEN PAGE\ CHOOSE FILE<BR> 
Click on your WEBPAGES folder\ FIRST file<BR>
Click 'open' and your page should appear.
<P>On Internet Explorer: <BR>
Top menu; FILE\ OPEN\ BROWSE <BR> 
Click on your WEBPAGES folder\ FIRST file<BR>
Click 'open' and your page should appear.<BR>


<P>If the page doesn't open, go back over your notepad typing and make sure that all the HTML tags are correct. Check there are no spaces between tags and internal text; check that all tags are closed; check that you haven't written < HTLM > or < BDDY >.  Your page will work eventually. 
<P>
Make another page. Call it somethingdifferent.html and place it in the same WEBPAGES folder as detailed above.
<P>start formatting in <A HREF="webpage2.html">lesson two</A>
<BR><A HREF="col3.html">back to wws index</A> </P>
</P>
 
  
</DIV>


</TD>
</TR>
</TABLE>
</BODY>
</HTML>








`
