# go-github #

go-github is a Go client library for accessing the [GitHub API][].

**Documentation:** [![GoDoc](https://godoc.org/github.com/google/go-github/github?status.svg)](https://godoc.org/github.com/google/go-github/github)  
**Mailing List:** [go-github@googlegroups.com](https://groups.google.com/group/go-github)  
**Build Status:** [![Build Status](https://travis-ci.org/google/go-github.svg?branch=master)](https://travis-ci.org/google/go-github)  
**Test Coverage:** [![Test Coverage](https://coveralls.io/repos/google/go-github/badge.svg?branch=master)](https://coveralls.io/r/google/go-github?branch=master) ([gocov report](https://drone.io/github.com/google/go-github/files/coverage.html))

go-github requires Go version 1.4 or greater.

## Usage ##

```go
import "github.com/google/go-github/github"
```

Construct a new GitHub client, then use the various services on the client to
access different parts of the GitHub API.  For example, to list all
organizations for user "willnorris":

```go
client := github.NewClient(nil)
orgs, _, err := client.Organizations.List("willnorris", nil)
```

Some API methods have optional parameters that can be passed.  For example,
to list public repositories for the "github" organization:

```go
client := github.NewClient(nil)
opt := &github.RepositoryListByOrgOptions{Type: "public"}
repos, _, err := client.Repositories.ListByOrg("github", opt)
```

### Authentication ###

The go-github library does not directly handle authentication.  Instead, when
creating a new client, pass an `http.Client` that can handle authentication for
you.  The easiest and recommended way to do this is using the [oauth2][]
library, but you can always use any other library that provides an
`http.Client`.  If you have an OAuth2 access token (for example, a [personal
API token][]), you can use it with oauth2 using:

```go
func main() {
  ts := oauth2.StaticTokenSource(
    &oauth2.Token{AccessToken: "... your access token ..."},
  )
  tc := oauth2.NewClient(oauth2.NoContext, ts)

  client := github.NewClient(tc)

  // list all repositories for the authenticated user
  repos, _, err := client.Repositories.List("", nil)
}
```

See the [oauth2 docs][] for complete instructions on using that library.

For API methods that require HTTP Basic Authentication, use the
[`BasicAuthTransport`](https://godoc.org/github.com/google/go-github/github#BasicAuthTransport).

### Pagination ###

All requests for resource collections (repos, pull requests, issues, etc)
support pagination. Pagination options are described in the
`github.ListOptions` struct and passed to the list methods directly or as an
embedded type of a more specific list options struct (for example
`github.PullRequestListOptions`).  Pages information is available via
`github.Response` struct.

```go
client := github.NewClient(nil)
opt := &github.RepositoryListByOrgOptions{
  Type: "public",
  ListOptions: github.ListOptions{PerPage: 10, Page: 2},
}
repos, resp, err := client.Repositories.ListByOrg("github", opt)
fmt.Println(resp.NextPage) // outputs 3
```

For complete usage of go-github, see the full [package docs][].

[GitHub API]: https://developer.github.com/v3/
[oauth2]: https://github.com/golang/oauth2
[oauth2 docs]: https://godoc.org/golang.org/x/oauth2
[personal API token]: https://github.com/blog/1509-personal-api-tokens
[package docs]: https://godoc.org/github.com/google/go-github/github

### Integration Tests ###

You can run integration tests from the `tests` directory. See the integration tests [README](tests/README.md).
## Roadmap ##

This library is being initially developed for an internal application at
Google, so API methods will likely be implemented in the order that they are
needed by that application.  You can track the status of implementation in
[this Google spreadsheet][roadmap].  Eventually, I would like to cover the entire
GitHub API, so contributions are of course [always welcome][contributing].  The
calling pattern is pretty well established, so adding new methods is relatively
straightforward.

[roadmap]: https://docs.google.com/spreadsheet/ccc?key=0ApoVX4GOiXr-dGNKN1pObFh6ek1DR2FKUjBNZ1FmaEE&usp=sharing
[contributing]: CONTRIBUTING.md


## License ##

This library is distributed under the BSD-style license found in the [LICENSE](./LICENSE)
file.
