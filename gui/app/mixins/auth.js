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

import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
	appMeta: service(),
	isAuthProviderDocumize: true,
	isAuthProviderKeycloak: false,
	isAuthProviderLDAP: false,
	isAuthProviderCAS: false,
	isDualAuth: false,

	init() {
		this._super(...arguments);
		let constants = this.get('constants');

		this.set('isAuthProviderDocumize', this.get('appMeta.authProvider') === constants.AuthProvider.Documize);
		this.set('isAuthProviderKeycloak', this.get('appMeta.authProvider') === constants.AuthProvider.Keycloak);
		this.set('isAuthProviderLDAP', this.get('appMeta.authProvider') === constants.AuthProvider.LDAP);
		this.set('isAuthProviderCAS', this.get('appMeta.authProvider') == constants.AuthProvider.CAS);

		if (this.get('appMeta.authProvider') === constants.AuthProvider.LDAP) {
			let config = this.get('appMeta.authConfig');

			if (!_.isUndefined(config) && !_.isNull(config) && !_.isEmpty(config) ) {
				config = JSON.parse(config);
				this.set('isDualAuth', config.allowFormsAuth);
			} else {
				this.set('isDualAuth', false);
			}
		}
	}
});
