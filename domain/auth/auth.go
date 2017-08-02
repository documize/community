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

package auth

import (
	"encoding/json"

	"github.com/documize/community/core/env"
	"github.com/documize/community/model/auth"
)

// StripAuthSecrets removes sensitive data from auth provider configuration
func StripAuthSecrets(r *env.Runtime, provider, config string) string {
	switch provider {
	case "documize":
		return config
		break
	case "keycloak":
		c := auth.KeycloakConfig{}
		err := json.Unmarshal([]byte(config), &c)
		if err != nil {
			r.Log.Error("StripAuthSecrets", err)
			return config
		}
		c.AdminPassword = ""
		c.AdminUser = ""
		c.PublicKey = ""

		j, err := json.Marshal(c)
		if err != nil {
			r.Log.Error("StripAuthSecrets", err)
			return config
		}

		return string(j)
		break
	}

	return config
}
