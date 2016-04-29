package endpoint

import (
	// "bytes"
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"

	"github.com/gorilla/mux"
)

// GetOrganization returns the requested organization.
func GetOrganization(w http.ResponseWriter, r *http.Request) {
	method := "GetOrganization"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	orgID := params["orgID"]

	if orgID != p.Context.OrgID {
		writeForbiddenError(w)
		return
	}

	org, err := p.GetOrganization(p.Context.OrgID)

	if err != nil && err != sql.ErrNoRows {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(org)

	if err != nil {
		writeJSONMarshalError(w, method, "organization", err)
		return
	}

	writeSuccessBytes(w, json)
}

// UpdateOrganization saves organization amends.
func UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	method := "UpdateOrganization"
	p := request.GetPersister(r)

	if !p.Context.Administrator {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var org = entity.Organization{}
	err = json.Unmarshal(body, &org)

	org.RefID = p.Context.OrgID

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.UpdateOrganization(org)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	json, err := json.Marshal(org)

	if err != nil {
		writeJSONMarshalError(w, method, "organization", err)
		return
	}

	writeSuccessBytes(w, json)
}
