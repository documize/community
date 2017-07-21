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
	"fmt"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	gogithub "github.com/google/go-github/github"
)

func listFailed(rt env.Runtime, method string, config githubConfig, client *gogithub.Client, w http.ResponseWriter) (failed bool) {
	switch method { // which list to choose?

	case "owners":

		me, _, err := client.Users.Get("")
		if err != nil {
			rt.Log.Error("github get user details:", err)
			provider.WriteError(w, "github", err)
			return
		}

		orgs, _, err := client.Organizations.List("", nil)
		if err != nil {
			rt.Log.Error("github get user's organisations:", err)
			provider.WriteError(w, "github", err)
			return
		}

		owners := make([]githubOwner, 1+len(orgs))
		owners[0] = githubOwner{ID: *me.Login, Name: *me.Login}
		for ko, vo := range orgs {
			id := 1 + ko
			owners[id].ID = *vo.Login
			owners[id].Name = *vo.Login
		}

		owners = sortOwners(owners)

		provider.WriteJSON(w, owners)

	case "orgrepos":

		var render []githubBranch
		if config.Owner != "" {

			me, _, err := client.Users.Get("")
			if err != nil {
				rt.Log.Error("github get user details:", err)
				provider.WriteError(w, "github", err)
				return
			}

			var repos []*gogithub.Repository
			if config.Owner == *me.Login {
				repos, _, err = client.Repositories.List(config.Owner, nil)
			} else {
				opt := &gogithub.RepositoryListByOrgOptions{
					ListOptions: gogithub.ListOptions{PerPage: 100},
				}
				repos, _, err = client.Repositories.ListByOrg(config.Owner, opt)
			}
			if err != nil {
				rt.Log.Error("github get user/org repositories:", err)
				provider.WriteError(w, "github", err)
				return
			}
			for _, vr := range repos {
				render = append(render,
					githubBranch{
						Name:     "master",
						ID:       fmt.Sprintf("%s:%s", config.Owner, *vr.Name),
						Owner:    config.Owner,
						Repo:     *vr.Name,
						Private:  *vr.Private,
						Included: false,
						URL:      *vr.HTMLURL,
					})
			}
		}
		render = sortBranches(render)

		provider.WriteJSON(w, render)

	case "content":

		provider.WriteJSON(w, refreshReportData(&config, client))

	default:
		return true // failed to get a list
	}
	return
}
