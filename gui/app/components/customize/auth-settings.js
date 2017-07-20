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
import constants from '../../utils/constants';
import encoding from '../../utils/encoding';
import NotifierMixin from "../../mixins/notifier";

const {
	computed
} = Ember;

export default Ember.Component.extend(NotifierMixin, {
	appMeta: Ember.inject.service(),
	isDocumizeProvider: computed.equal('authProvider', constants.AuthProvider.Documize),
	isKeycloakProvider: computed.equal('authProvider', constants.AuthProvider.Keycloak),
	KeycloakUrlError: computed.empty('keycloakConfig.url'),
	KeycloakRealmError: computed.empty('keycloakConfig.realm'),
	KeycloakClientIdError: computed.empty('keycloakConfig.clientId'),
	KeycloakPublicKeyError: computed.empty('keycloakConfig.publicKey'),
	KeycloakAdminUserError: computed.empty('keycloakConfig.adminUser'),
	KeycloakAdminPasswordError: computed.empty('keycloakConfig.adminPassword'),
	keycloakConfig: { 
		url: '',
		realm: '',
		clientId: '',
		publicKey: '',
		adminUser: '',
		adminPassword: '',
		group: '',
		disableLogout: false,
		defaultPermissionAddSpace: false
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let provider = this.get('authProvider');

		switch (provider) {
			case constants.AuthProvider.Documize:
				// nothing to do
				break;
			case constants.AuthProvider.Keycloak: // eslint-disable-line no-case-declarations
				let config = this.get('authConfig');

				if (is.undefined(config) || is.null(config) || is.empty(config) ) {
					config = {};
				} else {
					config = JSON.parse(config);
					config.publicKey = encoding.Base64.decode(config.publicKey);
					config.defaultPermissionAddSpace = config.hasOwnProperty('defaultPermissionAddSpace') ? config.defaultPermissionAddSpace : false;
					config.disableLogout = config.hasOwnProperty('disableLogout') ? config.disableLogout : true;
				}

				this.set('keycloakConfig', config);
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
			let provider = this.get('authProvider');
			let config = this.get('authConfig');

			switch (provider) {
				case constants.AuthProvider.Documize:
					config = {};
					break;
				case constants.AuthProvider.Keycloak:
					if (this.get('KeycloakUrlError')) {
						this.$("#keycloak-url").focus();
						return;
					}
					if (this.get('KeycloakRealmError')) {
						this.$("#keycloak-realm").focus();
						return;
					}
					if (this.get('KeycloakClientIdError')) {
						this.$("#keycloak-clientId").focus();
						return;
					}
					if (this.get('KeycloakPublicKeyError')) {
						this.$("#keycloak-publicKey").focus();
						return;
					}
					if (this.get('KeycloakAdminUserError')) {
						this.$("#keycloak-admin-user").focus();
						return;
					}
					if (this.get('KeycloakAdminPasswordError')) {
						this.$("#keycloak-admin-password").focus();
						return;
					}

					config = Ember.copy(this.get('keycloakConfig'));
					config.url = config.url.trim();
					config.realm = config.realm.trim();
					config.clientId = config.clientId.trim();
					config.publicKey = config.publicKey.trim();
					config.group = is.undefined(config.group) ? '' : config.group.trim();
					config.adminUser = config.adminUser.trim();
					config.adminPassword = config.adminPassword.trim();
					config.defaultPermissionAddSpace = config.hasOwnProperty('defaultPermissionAddSpace') ? config.defaultPermissionAddSpace : true;
					config.disableLogout = config.hasOwnProperty('disableLogout') ? config.disableLogout : true;

					if (is.endWith(config.url, '/')) {
						config.url = config.url.substring(0, config.url.length-1);
					}

					Ember.set(config, 'publicKey', encoding.Base64.encode(this.get('keycloakConfig.publicKey')));
					break;
			}
			
			let data = { authProvider: provider, authConfig: JSON.stringify(config) };

			this.get('onSave')(data).then(() => {
				if (data.authProvider === constants.AuthProvider.Keycloak) {
					this.get('onSync')().then((response) => {
						if (response.isError) {
							this.showNotification(response.message);
							data.authProvider = constants.AuthProvider.Documize;
							this.get('onSave')(data).then(() => {
								this.showNotification('Reverted back to Documize');
							});
						} else {
							if (data.authProvider === this.get('appMeta.authProvider')) {
								this.showNotification(response.message);
							} else {
								this.get('onChange')(data);
							}
						}
					});
				} else {
					this.showNotification('Saved');
				}
			});
		}
	}
});
