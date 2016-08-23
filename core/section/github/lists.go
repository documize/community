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

	"github.com/documize/community/core/log"
	"github.com/documize/community/core/section/provider"

	gogithub "github.com/google/go-github/github"
)

func listFailed(method string, config githubConfig, client *gogithub.Client, w http.ResponseWriter) (failed bool) {
	switch method { // which list to choose?

	case "owners":

		me, _, err := client.Users.Get("")
		if err != nil {
			log.Error("github get user details:", err)
			provider.WriteError(w, "github", err)
			return
		}

		orgs, _, err := client.Organizations.List("", nil)
		if err != nil {
			log.Error("github get user's organisations:", err)
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

	/*
		case "repos":

			var render []githubRepo
			if config.Owner != "" {

				me, _, err := client.Users.Get("")
				if err != nil {
					log.Error("github get user details:", err)
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
					log.Error("github get user/org repositories:", err)
					provider.WriteError(w, "github", err)
					return
				}
				for _, vr := range repos {
					private := ""
					if *vr.Private {
						private = " (private)"
					}
					render = append(render,
						githubRepo{
							Name:    config.Owner + "/" + *vr.Name + private,
							ID:      fmt.Sprintf("%s:%s", config.Owner, *vr.Name),
							Owner:   config.Owner,
							Repo:    *vr.Name,
							Private: *vr.Private,
							URL:     *vr.HTMLURL,
						})
				}
			}
			render = sortRepos(render)

			provider.WriteJSON(w, render)

		case "branches":

			if config.Owner == "" || config.Repo == "" {
				provider.WriteJSON(w, []githubBranch{}) // we have nothing to return
				return
			}
			branches, _, err := client.Repositories.ListBranches(config.Owner, config.Repo,
				&gogithub.ListOptions{PerPage: 100})
			if err != nil {
				log.Error("github get branch details:", err)
				provider.WriteError(w, "github", err)
				return
			}
			render := make([]githubBranch, len(branches))
			for kc, vb := range branches {
				render[kc] = githubBranch{
					Owner:    config.Owner,
					Repo:     config.Repo,
					Name:     *vb.Name,
					ID:       fmt.Sprintf("%s:%s:%s", config.Owner, config.Repo, *vb.Name),
					Included: false,
					URL:      "https://github.com/" + config.Owner + "/" + config.Repo + "/tree/" + *vb.Name,
				}
			}

			provider.WriteJSON(w, render)
	*/

	case "orgrepos":

		var render []githubBranch
		if config.Owner != "" {

			me, _, err := client.Users.Get("")
			if err != nil {
				log.Error("github get user details:", err)
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
				log.Error("github get user/org repositories:", err)
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

	/*
		case "labels":

			if config.Owner == "" || config.Repo == "" {
				provider.WriteJSON(w, []githubBranch{}) // we have nothing to return
				return
			}
			labels, _, err := client.Issues.ListLabels(config.Owner, config.Repo,
				&gogithub.ListOptions{PerPage: 100})
			if err != nil {
				log.Error("github get labels:", err)
				provider.WriteError(w, "github", err)
				return
			}
			render := make([]githubBranch, len(labels))
			for kc, vb := range labels {
				render[kc] = githubBranch{
					Name:     *vb.Name,
					ID:       fmt.Sprintf("%s:%s:%s", config.Owner, config.Repo, *vb.Name),
					Included: false,
					Color:    *vb.Color,
				}
			}

			provider.WriteJSON(w, render)
	*/

	default:
		return true // failed to get a list
	}
	return
}
