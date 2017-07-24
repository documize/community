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

package document

import (
	"fmt"

	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/pkg/errors"
)

// MoveDocumentSpace changes the label for client's organization's documents which have space "id", to "move".
func MoveDocumentSpace(s domain.StoreContext, id, move string) (err error) {
	stmt, err := s.Context.Transaction.Preparex("UPDATE document SET labelid=? WHERE orgid=? AND labelid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare document space move %s", id))
		return
	}

	_, err = stmt.Exec(move, s.Context.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute document space move %s", id))
		return
	}

	return
}
