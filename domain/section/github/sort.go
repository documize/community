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

import "sort"

// sort owners in order that that should be presented.
type ownersToSort []githubOwner

func (s ownersToSort) Len() int      { return len(s) }
func (s ownersToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s ownersToSort) Less(i, j int) bool {
	return s[i].Name < s[j].Name
}

func sortOwners(in []githubOwner) []githubOwner {
	sts := ownersToSort(in)
	sort.Sort(sts)
	return []githubOwner(sts)
}

// sort branches in order that that should be presented.
func sortBranches(in []githubBranch) []githubBranch {
	sts := branchesToSort(in)
	sort.Sort(sts)
	return []githubBranch(sts)
}
