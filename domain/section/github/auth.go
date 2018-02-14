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

package github

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/section/provider"
	gogithub "github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

func clientID(ctx domain.RequestContext, s *domain.Store) string {
	c, _ := s.Setting.Get(meta.ConfigHandle(), "clientID")
	return c
}

func clientSecret(ctx domain.RequestContext, s *domain.Store) string {
	c, _ := s.Setting.Get(meta.ConfigHandle(), "clientSecret")
	return c
}

func authorizationCallbackURL(ctx domain.RequestContext, s *domain.Store) string {
	// NOTE: URL value must have the path and query "/api/public/validate?section=github"
	c, _ := s.Setting.Get(meta.ConfigHandle(), "authorizationCallbackURL")
	return c
}

func validateToken(ctx provider.Context, s *domain.Store, ptoken string) error {
	// Github authorization check
	authClient := gogithub.NewClient((&gogithub.BasicAuthTransport{
		Username: clientID(ctx.Request, s),
		Password: clientSecret(ctx.Request, s),
	}).Client())
	_, _, err := authClient.Authorizations.Check(context.Background(), clientID(ctx.Request, s), ptoken)
	return err
}

func (*Provider) githubClient(config *githubConfig) *gogithub.Client {
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: config.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	return gogithub.NewClient(tc)
}

// Callback is called by a browser redirect from Github, via the validation endpoint
func Callback(rt *env.Runtime, s *domain.Store, res http.ResponseWriter, req *http.Request) error {
	ctx := domain.GetRequestContext(req)

	code := req.URL.Query().Get("code")
	state := req.URL.Query().Get("state")

	ghurl := "https://github.com/login/oauth/access_token"
	vals := "client_id=" + clientID(ctx, s)
	vals += "&client_secret=" + clientSecret(ctx, s)
	vals += "&code=" + code
	vals += "&state=" + state

	req2, err := http.NewRequest("POST", ghurl+"?"+vals, strings.NewReader(vals))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req2.Header.Set("Accept", "application/json")

	res2, err := http.DefaultClient.Do(req2)
	if err != nil {
		return err
	}

	var gt githubCallbackT

	err = json.NewDecoder(res2.Body).Decode(&gt)
	if err != nil {
		return err
	}

	err = res2.Body.Close()
	if err != nil {
		return err
	}

	returl, err := url.QueryUnescape(state)
	if err != nil {
		return err
	}

	up, err := url.Parse(returl)
	if err != nil {
		return err
	}

	target := up.Scheme + "://" + up.Host + up.Path + "?mode=edit&code=" + gt.AccessToken

	http.Redirect(res, req, target, http.StatusTemporaryRedirect)

	return nil
}
