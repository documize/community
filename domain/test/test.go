package test

import (
	"fmt"
	"github.com/documize/community/domain/store"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/edition/boot"
	"github.com/documize/community/edition/logging"
	"github.com/documize/community/embed"
	"github.com/documize/community/server/web"
	_ "github.com/go-sql-driver/mysql" // testing
)

// SetupTest prepares test environment
func SetupTest() (rt *env.Runtime, s *store
    .Store, ctx domain.RequestContext) {
	rt, s = startRuntime()
	ctx = setupContext()
	return rt, s, ctx
}

func startRuntime() (rt *env.Runtime, s *store.Store) {
	rt = new(env.Runtime)
	s = new(store.Store)

	rt.Log = logging.NewLogger(false)
	web.Embed = embed.NewEmbedder()

	rt.Product = env.Product{}
	rt.Product.Major = "0"
	rt.Product.Minor = "0"
	rt.Product.Patch = "0"
	rt.Product.Version = fmt.Sprintf("%s.%s.%s", rt.Product.Major, rt.Product.Minor, rt.Product.Patch)
	rt.Product.Edition = "Test"
	rt.Product.Title = fmt.Sprintf("%s Edition", rt.Product.Edition)

    // parse settings from command line and environment
	rt.Flags = env.ParseFlags()
	boot.InitRuntime(rt, s)

	// section.Register(rt, s)

	return rt, s
}

// setup testing context
func setupContext() domain.RequestContext {
	ctx := domain.RequestContext{}
	ctx.AllowAnonymousAccess = true
	ctx.Authenticated = true
	ctx.Administrator = true
	ctx.Guest = false
	ctx.Editor = true
	ctx.GlobalAdmin = true
	ctx.UserID = "test"
	ctx.OrgID = "test"
	return ctx
}

// For dummy user data https://www.mockaroo.com
