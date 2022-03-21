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

package domain

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"encoding/xml"
	"time"
)

// Edition is either Community or Enterprise.
type Edition string

// Package controls feature-set within edition.
type Package string

// Plan tells us if instance if self-hosted or Documize SaaS/Cloud.
type Plan string

// Seats represents number of users.
type Seats int

const (
	// CommunityEdition is AGPL licensed open core of product.
	CommunityEdition Edition = "Community"

	// EnterpriseEdition is proprietary closed-source product.
	EnterpriseEdition Edition = "Community+"

	// PlanCloud represents *.documize.com hosting.
	PlanCloud Plan = "Cloud"

	// PlanSelfHost represents privately hosted Documize instance.
	PlanSelfHost Plan = "Self-host"

	// Seats0 is 0 users.
	Seats0 Seats = 0

	// Seats1 is 10 users.
	Seats1 Seats = 10

	// Seats2 is 25 users.
	Seats2 Seats = 25

	//Seats3 is 50 users.
	Seats3 Seats = 50

	// Seats4 is 100 users.
	Seats4 Seats = 100

	//Seats5 is 250 users.
	Seats5 Seats = 250

	// Seats6 is unlimited.
	Seats6 Seats = 9999
)

// Product provides product meta information and handles
// subscription validation for Enterprise edition.
type Product struct {
	Edition  Edition
	Title    string
	Version  string
	Major    string
	Minor    string
	Patch    string
	Revision string

	// UserCount is number of users within Documize instance by tenant.
	UserCount map[string]int
}

// IsValid returns if subscription is valid using RequestContext.
func (p *Product) IsValid(ctx RequestContext) bool {
	return true

	// Community edition is always valid.
	// if p.Edition == CommunityEdition {
	// 	return true
	// }

	// Empty means we cannot be valid.
	// if ctx.Subscription.IsEmpty() {
	// 	return false
	// }

	// Enterprise edition is valid if system has loaded up user count by tenant.
	// if uc, ok := p.UserCount[ctx.OrgID]; ok {
	// 	// Enterprise edition is valid if subcription date is greater than now and we have enough users/seats.
	// 	if time.Now().UTC().Before(ctx.Subscription.End) && uc <= int(ctx.Subscription.Seats) {
	// 		return true
	// 	}
	// } else {
	// 	// First 10 is free for Enterprise edition.
	// 	if Seats1 == ctx.Subscription.Seats && time.Now().UTC().Before(ctx.Subscription.End) {
	// 		return true
	// 	}
	// }

	// return false
}

// SubscriptionData holds encrypted data and is unpacked into Subscription.
type SubscriptionData struct {
	Key       string `json:"key"`
	Signature string `json:"signature"`
}

// SubscriptionXML represents subscription data as XML document.
type SubscriptionXML struct {
	XMLName   xml.Name `xml:"Documize"`
	Key       string
	Signature string
}

// Subscription data for customer.
type Subscription struct {
	ID      string    `json:"id"`
	Name    string    `json:"name"`
	Email   string    `json:"email"`
	Edition Edition   `json:"edition"`
	Plan    Plan      `json:"plan"`
	Start   time.Time `json:"start"`
	End     time.Time `json:"end"`
	Seats   Seats     `json:"seats"`
	Trial   bool      `json:"trial"`
	Price   uint64    `json:"price"`
	// Derived fields
	ActiveUsers int `json:"activeUsers"`
	Status      int `json:"status"`
}

// IsEmpty determines if we have a license.
func (s *Subscription) IsEmpty() bool {
	return s.Seats == Seats0 &&
		len(s.Name) == 0 && len(s.Email) == 0 && s.Start.Year() == 1 && s.End.Year() == 1
}

// SubscriptionUserAccount states number of active users by tenant.
type SubscriptionUserAccount struct {
	OrgID string `json:"orgId"`
	Users int    `json:"users"`
}

// SubscriptionAsXML returns subscription data as XML document:
//
// <DocumizeLicense>
//   <Key>some key</Key>
//   <Signature>some signature</Signature>
// </DocumizeLicense>
//
// XML document is empty in case of error.
func SubscriptionAsXML(j SubscriptionData) (b []byte, err error) {
	x := &SubscriptionXML{Key: j.Key, Signature: j.Signature}
	b, err = xml.Marshal(x)

	return
}

// DecodeSubscription returns Documize issued product licensing information.
func DecodeSubscription(sd SubscriptionData) (sub Subscription, err error) {
	// Empty check.
	if len(sd.Key) == 0 || len(sd.Signature) == 0 {
		return
	}

	var ciphertext, signature []byte
	ciphertext, _ = hex.DecodeString(sd.Key)
	signature, _ = hex.DecodeString(sd.Signature)

	// Load up keys.
	serverBlock, _ := pem.Decode([]byte(serverPublicKeyPEM4096))
	serverPublicKey, _ := x509.ParsePKIXPublicKey(serverBlock.Bytes)
	clientBlock, _ := pem.Decode([]byte(clientPrivateKeyPEM4096))
	clientPrivateKey, _ := x509.ParsePKCS1PrivateKey(clientBlock.Bytes)

	label := []byte("dmzsub")
	hash := sha256.New()
	plainText, err := rsa.DecryptOAEP(hash, rand.Reader, clientPrivateKey, ciphertext, label)
	if err != nil {
		return
	}

	// check signature
	var opts rsa.PSSOptions
	opts.SaltLength = rsa.PSSSaltLengthAuto
	PSSmessage := plainText
	newhash := crypto.SHA256
	pssh := newhash.New()
	pssh.Write(PSSmessage)
	hashed := pssh.Sum(nil)

	err = rsa.VerifyPSS(serverPublicKey.(*rsa.PublicKey), newhash, hashed, signature, &opts)
	if err != nil {
		return
	}

	err = json.Unmarshal(plainText, &sub)

	return
}

var serverPublicKeyPEM4096 = `
-----BEGIN PUBLIC KEY-----
MIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgB1/J5crBk0rK+zkPn6p4nf
qitsftN1/wrGq3xrXLhBax/+zyr3wm4Cd8bYANZjfzKw8jSoTqhoqwGF2J1A8Mjg
Orfn04UGsM/Em+5g2b6d/Uc3tyoR7DJYwr0coc0rPZaypneAhaf6ob266CU8QEdE
xkRkPMc/1TAOPmUkeuM2LI9Q/LDA5zPnN3WgYLGd7O1bSVOQYjw4KVp7Xr987Cec
CHWzrrjwQ7vRYUqxpz1kQ8ZAmhnFAkAQzScE87kPKM9V2Txo0NQ9aL2idP2FoVi0
obgGfJShI25YAeQncJBsyHV/uWxd3l/egaTHyQlcMgxBv61qsqgKzFZFsTNleQ3x
SR4i8QnNLk0hwtR+NREJZRlIdMGBwV7elJa+8v8Zw6lbC1J8OghNseggGcBOoG6v
OOwnEy6DK7hS3qfnHhFvR2zr9R5iQLHBIeVaVFZiLMKffRZnyHc3Dt5ozFMvpnzH
TBaHzydI57mrYZKv3s8hEgVJqMA9d1zCd9bwPwDIqiR/tYgPadwagQwHE4d4Pg8f
K8anfghelduKB0qIfeuQIEKmErEDK/qHj8HUC4nYUQy7hIo4F9D/HB22IfD6rM4D
BrswLjnIDcW9ox8Sv2wT5FsRJqdYE80gmG68QjrGPcwqwkO6WhgAfr/LXx2kJ2HI
BAMmkAYoyOaGK82XYKC14wIDAQAB
-----END PUBLIC KEY-----
`

var clientPublicKeyPEM4096 = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmtXoHjZ4Ky7gMqp9gY4f
TQ+EhtgGxlkn3b48doQXhHemq/QyrcVj5FcHr9Um6pxop/HDQX2N7DEKX52ShFwa
Ccv7iWWcZ8secope3nNouO80v9umb0LqWqVvfZSP4QbwDZa231baFWtnn2yiiOmA
SkLmexLU+fmGht2Df9Q0gQLofGeE6YzLrdvnwa1NJHEiowgWaS5dsvsxoZV6zDXG
428drRQ/JVt7soQbZENn0jiGSM+Tm77eXjMSu1oK8tnr7vm8ylBXj4rw6P4ONp50
Dd+lERsdJFK5EaKN4xnWVVKayUlZTFE8ZAMXckF48dG8i9IgRkkEf7UcKekB/+hT
1zIKHwmFjUy81jAmU5jySHFHfaGkIQKoKGFXQQt6st9rPLSLOFi8jLHYbJAO/Zs5
DTaOoGLwDYcPMsgZswUyxySBUPDXDzg31sIJYl35GmZf6AX7vWvcX3C0NJxhnEFy
eXnyJMe3yUHOJmJmYT91V/IKmUl51xdCdb8Gy9wM2oee9QEvM8BJEctGrXmcCuVb
V7qkA79D3UK9QTbOthHsPWeWbaJDsmaxlwwp+crGTpcTLOyzwZdLaOr4bmNCQKUW
OC0hPqiwhHsxPwA8Je98EvjLT9YC23+dCN2OoN4cpnRtl/rYNtlCHnIQ1l+n4hvs
LMsDcJ/rlaak4OADM1YvNxUCAwEAAQ==
-----END PUBLIC KEY-----
`

var clientPrivateKeyPEM4096 = `
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
`
