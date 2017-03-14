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

import Ember from 'ember';
import constants from '../utils/constants';

const {
	computed
} = Ember;

export default Ember.Component.extend({
	isDocumizeProvider: computed.equal('authProvider', constants.AuthProvider.Documize),
	isKeycloakProvider: computed.equal('authProvider', constants.AuthProvider.Keycloak),
	KeycloakConfigError: computed.empty('keycloakConfig'),
	keycloakConfig: '',

	didReceiveAttrs() {
		this._super(...arguments);

		let provider = this.get('authProvider');

		switch (provider) {
			case constants.AuthProvider.Documize:
				break;
			case constants.AuthProvider.Keycloak:
				this.set('keycloakConfig', this.get('authConfig'));
				break;
		}
	},

	actions: {
		onDocumize() {
			this.set('authProvider', constants.AuthProvider.Documize);
		},

		onKeycloak() {
			this.set('authProvider', constants.AuthProvider.Keycloak);
		},

		onSave() {
			if (this.get('KeycloakConfigError')) {
				this.$("#keycloak-id").focus();
				return;
			}

			let provider = this.get('authProvider');
			let config = this.get('authConfig');

			switch (provider) {
				case constants.AuthProvider.Documize:
					config = {};
					break;
				case constants.AuthProvider.Keycloak:
					config = this.get('keycloakConfig');
					break;
			}

			this.get('onSave')(provider, config).then(() => {
			});
		},
	}
});
