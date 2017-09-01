package test

import (
	"fmt"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/edition/boot"
	"github.com/documize/community/edition/logging"
	"github.com/documize/community/embed"
	"github.com/documize/community/server/web"
	_ "github.com/go-sql-driver/mysql" // testing
)

// SetupTest prepares test environment
func SetupTest() (rt *env.Runtime, s *domain.Store, ctx domain.RequestContext) {
	rt, s = startRuntime()
	ctx = setupContext()
	return rt, s, ctx
}

func startRuntime() (rt *env.Runtime, s *domain.Store) {
	rt = new(env.Runtime)
	s = new(domain.Store)

	rt.Log = logging.NewLogger()
	web.Embed = embed.NewEmbedder()

	rt.Product = env.ProdInfo{}
	rt.Product.Major = "0"
	rt.Product.Minor = "0"
	rt.Product.Patch = "0"
	rt.Product.Version = fmt.Sprintf("%s.%s.%s", rt.Product.Major, rt.Product.Minor, rt.Product.Patch)
	rt.Product.Edition = "Test"
	rt.Product.Title = fmt.Sprintf("%s Edition", rt.Product.Edition)
	rt.Product.License = env.License{}
	rt.Product.License.Seats = 1
	rt.Product.License.Valid = true
	rt.Product.License.Trial = false
	rt.Product.License.Edition = "Community"

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
	ctx.Global = true
	ctx.UserID = "test"
	ctx.OrgID = "test"
	return ctx
}
