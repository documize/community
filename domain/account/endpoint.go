package account

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   domain.Store
}
