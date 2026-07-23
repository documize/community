# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Documize Community — a self-hosted knowledge management app. Backend is Go, frontend is Ember JS; the build compiles both into a single executable binary. Licensed AGPLv3. This repo is the Community edition (a separate closed-source "Community+" edition adds enterprise features on top).

## Build & run

Backend (Go):
```
mkdir -p edition/static && touch edition/static/.keep   # see prerequisite note below
go build -mod=vendor -o bin/documize-community ./edition/community.go
go vet ./...
go test ./...                      # single package: go test ./domain/backup/...
```
The module uses `vendor/` (`-mod=vendor` is required, vendoring is checked in). Go version pinned in `go.mod` (currently 1.19, though README/Dockerfile reference 1.21.x toolchains — check both before assuming).

**Asset prerequisite:** `edition/community.go` has `//go:embed static/*`, and `edition/static/` is gitignored and empty in a fresh checkout — it's only populated by `build.sh`/Dockerfile (Ember build output, mail templates, DB scripts, onboarding JSON). Because of this, `go build ./edition/community.go`, `go vet ./...`, and `go test ./...` all fail with `pattern static/*: no matching files found` until at least one file exists under `edition/static/` (a placeholder file is enough to satisfy the embed for compilation; run the relevant parts of `build.sh` to get real assets). Testing an individual non-`edition` package, e.g. `go test ./domain/backup/...`, does not require this since it doesn't compile the `edition` package.

Frontend (Ember, in `gui/`):
```
cd gui
npm install
npm start                # ember serve, dev server w/ live reload
npm run build             # ember build
npm test                  # ember test
npm run lint:js
npm run lint:hbs
```
`NODE_OPTIONS=--openssl-legacy-provider` is needed for production builds with modern Node (see `build.sh`).

Full production build (`build.sh`): builds Ember assets, copies them plus mail templates, DB scripts (`core/database/scripts/{mysql,postgresql,sqlserver}`), and onboarding JSON into `edition/static/`, then cross-compiles the Go binary for each OS/arch via `go:embed`. Any change to email templates, seed/onboarding JSON, or DB scripts must be re-copied into `edition/static/` for the embedded build to pick it up — running `go build` directly against stale `edition/static/` content will silently use old assets.

Docker: multi-stage `Dockerfile` (node builder → golang builder → alpine runtime), also `docker-compose.yaml` for local DB-backed dev.

Running locally (see commented lines in `build.sh`):
```
go run edition/community.go -port=5001 -forcesslport=5002 -cert selfcert/cert.pem -key selfcert/key.pem -salt=<random>
```

## Architecture

Three-layer Go structure, all wired together in `edition/community.go` (the `main` package/entrypoint):

- **`core/`** — generic, product-agnostic infrastructure: DB connection/migration (`core/database`), env/flag parsing (`core/env`), mail sending (`core/mail`), secrets/crypto (`core/secrets`), pub/sub event bus (`core/event`), string/time/id utilities. Nothing here knows about Documize domain concepts (spaces, documents, users).
- **`model/`** — plain data structs per domain concept (`model/space`, `model/doc`, `model/user`, `model/permission`, etc.), no behavior.
- **`domain/`** — the application layer, one package per feature (`domain/space`, `domain/document`, `domain/category`, `domain/permission`, `domain/section/*`, ...). Each feature package typically has:
  - `endpoint.go` — HTTP handlers (`Handler{Runtime: rt, Store: s}` struct receiver pattern)
  - `store.go` — SQL implementation of that feature's storer interface
  - a model/business-logic file (e.g. `space.go`, `document.go`)
- **`domain/store/storer.go`** — defines one `XxxStorer` Go interface per feature and aggregates them into `store.Store`. This is the seam between business logic and persistence: swapping databases means implementing these interfaces, not touching `domain/*` handler code.
- **`edition/storage/`** — concrete DB provider wiring for mysql/postgresql/sqlserver, selected at boot by `DBType` flag (`edition/boot/runtime.go`).
- **`server/`** — HTTP server setup. `server/routing/routes.go` instantiates every feature's `Handler{Runtime, Store}` and registers its routes; `server/routing/container.go` and `server/middleware.go` handle cross-cutting concerns (auth, CORS, etc.); `server/web/serve.go` serves the embedded Ember static assets.
- **`domain/section/`** — pluggable "smart section" content providers (markdown, code, wysiwyg, table, trello, jira, plantuml, airtable, pdfjs, papertrail, gemini, ...). New section types are registered in `domain/section/register.go` via `provider.Register(name, &Provider{Runtime, Store})`; each implements the common interface in `domain/section/provider`.
- **`edition/`** — the composition root. `community.go` builds `env.Runtime` (config/logging/product info) and `store.Store`, boots the DB (`edition/boot`), registers sections, and starts the server. Static web assets (built Ember app, mail HTML templates, SQL scripts, onboarding JSON, i18n) are embedded via `//go:embed static/*`, populated by `build.sh`/Dockerfile — see build note above.
- **`gui/`** — Ember JS 3.12 SPA (classic app layout: `app/{routes,controllers,components,models,adapters,serializers,templates}`). Talks to the Go backend's JSON API. `gui/mirage/` provides mock API scenarios/factories for frontend tests without a live backend.

Request flow: `server/routing/routes.go` maps URL → feature `Handler` method → business logic in the feature's `domain/*` package → `store.Store.<Feature>` interface → concrete SQL in `domain/*/store.go` (dialect differences handled via `core/env.Runtime`/`Flags.DBType` and files like `domain/search/store_sqlserver.go`).

Auth: `domain/auth` plus pluggable providers `domain/auth/{ldap,keycloak,cas}`; JWT-based sessions (`domain/auth/jwt.go`).

## Testing conventions

Go tests are colocated (`_test.go` next to source), concentrated in `core/database`, `core/event`, `core/osutil`, `core/secrets`, `core/stringutil`, `core/uniqueid`, `domain/auth/ldap`, `domain/backup`, `domain/conversion`, `domain/mail`, `edition/storage`, `model/page`. Run a single test with `go test -run TestName ./path/to/package`.
