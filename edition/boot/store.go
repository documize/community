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

// Package boot prepares runtime environment.
package boot

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// AttachStore selects database persistence layer
func AttachStore(r *env.Runtime, s *domain.Store) {
	switch r.DbVariant {
	case env.DbVariantMySQL, env.DBVariantPercona, env.DBVariantMariaDB:
		StoreMySQL(r, s)
	case env.DBVariantMSSQL:
		// todo
	case env.DBVariantPostgreSQL:
		// todo
	}
}

// https://github.com/golang-sql/sqlexp/blob/c2488a8be21d20d31abf0d05c2735efd2d09afe4/quoter.go#L46
