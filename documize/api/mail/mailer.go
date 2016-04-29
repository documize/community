// jshint ignore:start

package mail

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"

	"github.com/documize/community/documize/web"
	"github.com/documize/community/wordsmith/environment"
	"github.com/documize/community/wordsmith/log"
)

// InviteNewUser invites someone new providing credentials, explaining the product and stating who is inviting them.
func InviteNewUser(recipient, inviter, url, username, password string) {
	method := "InviteNewUser"

	file, err := web.ReadFile("mail/invite-new-user.html")

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has invited you to Documize", inviter)

	e := newEmail()
	e.From = creds.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject  string
		Inviter  string
		Url      string
		Username string
		Password string
	}{
		subject,
		inviter,
		url,
		recipient,
		password,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	log.IfErr(t.Execute(buffer, &parameters))
	e.HTML = buffer.Bytes()

	err = e.Send(getHost(), getAuth())

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// InviteExistingUser invites a known user to an organization.
func InviteExistingUser(recipient, inviter, url string) {
	method := "InviteExistingUser"

	file, err := web.ReadFile("mail/invite-existing-user.html")

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has invited you to their Documize account", inviter)

	e := newEmail()
	e.From = creds.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject string
		Inviter string
		Url     string
	}{
		subject,
		inviter,
		url,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	log.IfErr(t.Execute(buffer, &parameters))
	e.HTML = buffer.Bytes()

	err = e.Send(getHost(), getAuth())

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// PasswordReset sends a reset email with an embedded token.
func PasswordReset(recipient, url string) {
	method := "PasswordReset"

	file, err := web.ReadFile("mail/password-reset.html")

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	subject := "Documize password reset request"

	e := newEmail()
	e.From = "Documize <hello@documize.com>"
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject string
		Url     string
	}{
		subject,
		url,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	log.IfErr(t.Execute(buffer, &parameters))
	e.HTML = buffer.Bytes()

	err = e.Send(getHost(), getAuth())

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// ShareFolderExistingUser provides an existing user with a link to a newly shared folder.
func ShareFolderExistingUser(recipient, inviter, url, folder, intro string) {
	method := "ShareFolderExistingUser"

	file, err := web.ReadFile("mail/share-folder-existing-user.html")

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has shared %s with you", inviter, folder)

	e := newEmail()
	e.From = creds.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject string
		Inviter string
		Url     string
		Folder  string
		Intro   string
	}{
		subject,
		inviter,
		url,
		folder,
		intro,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	log.IfErr(t.Execute(buffer, &parameters))
	e.HTML = buffer.Bytes()

	err = e.Send(getHost(), getAuth())

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// ShareFolderNewUser invites new user providing credentials, explaining the product and stating who is inviting them.
func ShareFolderNewUser(recipient, inviter, url, folder, invitationMessage string) {
	method := "ShareFolderNewUser"

	file, err := web.ReadFile("mail/share-folder-new-user.html")

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name 
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has shared %s with you on Documize", inviter, folder)

	e := newEmail()
	e.From = creds.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject    string
		Inviter    string
		Url        string
		Invitation string
		Folder     string
	}{
		subject,
		inviter,
		url,
		invitationMessage,
		folder,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	log.IfErr(t.Execute(buffer, &parameters))
	e.HTML = buffer.Bytes()

	err = e.Send(getHost(), getAuth())

	if err != nil {
		log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

var creds struct{ SMTPuserid, SMTPpassword, SMTPhost, SMTPport, SMTPsender string }

func init() {
	creds.SMTPport = "587"                             // the default value for outgoing SMTP traffic
	creds.SMTPsender = "Documize <hello@documize.com>" // TODO review as SAAS specific
	environment.GetString(&creds.SMTPuserid, "smtpuserid", false, "SMTP username for outgoing email", nil)
	environment.GetString(&creds.SMTPpassword, "smtppassword", false, "SMTP password for outgoing email", nil)
	environment.GetString(&creds.SMTPhost, "smtphost", false, "SMTP host for outgoing email", nil)
	environment.GetString(&creds.SMTPport, "smtpport", false, "SMTP port for outgoing email", nil)
	environment.GetString(&creds.SMTPsender, "smtpsender", false, "SMTP sender's e-mail for outgoing email", nil)
}

// Helper to return SMTP credentials
func getAuth() smtp.Auth {
	return smtp.PlainAuth("", creds.SMTPuserid, creds.SMTPpassword, creds.SMTPhost)
}

// Helper to return SMTP host details
func getHost() string {
	return creds.SMTPhost + ":" + creds.SMTPport
}
