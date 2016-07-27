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

package mail

import (
	//"fmt"
	"errors"
	"net/smtp"
	"os"
	"strings"
	"testing"

	"github.com/documize/community/core/log"
)

func TestMail(t *testing.T) {
	sender := "sender@documize.com"
	recipient := "recipient@documize.com"
	contains := []string{}
	var returnError error
	smtpSendMail = func(addr string, a smtp.Auth, from string, to []string, msg []byte) error {
		if addr != getHost() {
			t.Error("host incorrect:" + addr)
		}
		if from != "noreply@documize.com" && from != "hello@documize.com" {
			t.Error("sender incorrect:" + from)
		}
		if len(to) == 0 {
			t.Error("no recipient")
		} else {
			if to[0] != recipient {
				t.Error("recipient incorrect:" + to[0])
			}
		}
		for _, cont := range contains {
			if !strings.Contains(string(msg), cont) {
				t.Error("body does not contain:`" + cont + "` html:" + string(msg))
			}
		}
		//fmt.Println("DEBUG testSendMail", addr, a, from, to)
		return returnError
	}

	err := os.Chdir("..")
	if err != nil {
		t.Error(err)
	}
	url := "https://documize.com"
	contains = []string{url, sender}
	InviteNewUser(recipient, sender, url, "username", "password")
	contains = []string{url, "Your colleague"}
	InviteNewUser(recipient, "", url, "username", "password")
	contains = []string{url, sender}
	InviteExistingUser(recipient, sender, url)
	contains = []string{url, "Your colleague"}
	InviteExistingUser(recipient, "", url)
	contains = []string{url}
	PasswordReset(recipient, url)
	contains = []string{url, sender, "folder", "intro"}
	ShareFolderExistingUser(recipient, sender, url, "folder", "intro")
	contains = []string{url, "Your colleague", "folder", "intro"}
	ShareFolderExistingUser(recipient, "", url, "folder", "intro")
	contains = []string{url, sender, "folder", "invitationMessage string"}
	ShareFolderNewUser(recipient, sender, url, "folder", "invitationMessage string")
	contains = []string{url, "Your colleague", "folder", "invitationMessage string"}
	ShareFolderNewUser(recipient, "", url, "folder", "invitationMessage string")

	contains = []string{url}
	returnError = errors.New("test error")
	log.TestIfErr = true
	InviteNewUser(recipient, sender, url, "username", "password")
	if log.TestIfErr {
		t.Error("did not log an error when it should have")
	}
	log.TestIfErr = true
	InviteExistingUser(recipient, sender, url)
	if log.TestIfErr {
		t.Error("did not log an error when it should have")
	}
	log.TestIfErr = true
	PasswordReset(recipient, url)
	if log.TestIfErr {
		t.Error("did not log an error when it should have")
	}
	log.TestIfErr = true
	ShareFolderExistingUser(recipient, sender, url, "folder", "intro")
	if log.TestIfErr {
		t.Error("did not log an error when it should have")
	}
	log.TestIfErr = true
	ShareFolderNewUser(recipient, sender, url, "folder", "invitationMessage string")
	if log.TestIfErr {
		t.Error("did not log an error when it should have")
	}
}

// TODO: no tests (yet) for smtp.go as this is akin to a vendored package
