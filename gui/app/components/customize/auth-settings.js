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

import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { set } from '@ember/object';
import { copy } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import ModalMixin from '../../mixins/modal';
import encoding from '../../utils/encoding';
import Component from '@ember/component';

export default Component.extend(ModalMixin, Notifier, {
	appMeta: service(),
	globalSvc: service('global'),

	isDocumizeProvider: computed('authProvider', function() {
		return this.get('authProvider') === this.get('constants').AuthProvider.Documize;
	}),
	isKeycloakProvider: computed('authProvider', function() {
		return this.get('authProvider') === this.get('constants').AuthProvider.Keycloak;
	}),
	isLDAPProvider: computed('authProvider', function() {
		return this.get('authProvider') === this.get('constants').AuthProvider.LDAP;
	}),

	KeycloakUrlError: empty('keycloakConfig.url'),
	KeycloakRealmError: empty('keycloakConfig.realm'),
	KeycloakClientIdError: empty('keycloakConfig.clientId'),
	KeycloakPublicKeyError: empty('keycloakConfig.publicKey'),
	KeycloakAdminUserError: empty('keycloakConfig.adminUser'),
	KeycloakAdminPasswordError: empty('keycloakConfig.adminPassword'),
	keycloakFailure: '',

	ldapErrorServerHost: empty('ldapConfig.serverHost'),
	ldapErrorServerPort: computed('ldapConfig.serverPort', function() {
		return is.empty(this.get('ldapConfig.serverPort')) || is.not.number(parseInt(this.get('ldapConfig.serverPort')));
	}),
	ldapErrorBindDN: empty('ldapConfig.bindDN'),
	ldapErrorBindPassword: empty('ldapConfig.bindPassword'),
	ldapErrorNoFilter: computed('ldapConfig.{userFilter,groupFilter}', function() {
		return is.empty(this.get('ldapConfig.userFilter')) && is.empty(this.get('ldapConfig.groupFilter'));
	}),
	ldapErrorAttributeUserRDN: empty('ldapConfig.attributeUserRDN'),
	ldapErrorAttributeUserFirstname: empty('ldapConfig.attributeUserFirstname'),
	ldapErrorAttributeUserLastname: empty('ldapConfig.attributeUserLastname'),
	ldapErrorAttributeUserEmail: empty('ldapConfig.attributeUserEmail'),
	ldapErrorAttributeGroupMember: computed('ldapConfig.{groupFilter,attributeGroupMember}', function() {
		return is.not.empty(this.get('ldapConfig.groupFilter')) && is.empty(this.get('ldapConfig.attributeGroupMember'));
	}),

	init() {
		this._super(...arguments);

		let constants = this.get('constants');

		this.keycloakConfig = {
			url: '',
			realm: '',
			clientId: '',
			publicKey: '',
			adminUser: '',
			adminPassword: '',
			group: '',
			disableLogout: false,
			defaultPermissionAddSpace: false
		};

		this.ldapConfig =  {
			serverType:               constants.AuthProvider.ServerTypeLDAP,
			serverHost:               '',
			serverPort:               389,
			encryptionType:           constants.AuthProvider.EncryptionTypeStartTLS,
			baseDN:                   "",
			bindDN:                   "cn=admin,dc=planetexpress,dc=com",
			bindPassword:             "GoodNewsEveryone",
			userFilter:               "(|(objectClass=person)(objectClass=user)(objectClass=inetOrgPerson))",
			groupFilter:              "(&(objectClass=group)(|(cn=ship_crew)(cn=admin_staff)))",
			attributeUserRDN:         "uid",
			attributeUserFirstname:   "givenName",
			attributeUserLastname:    "sn",
			attributeUserEmail:       "mail",
			attributeUserDisplayName: "",
			attributeUserGroupName:   "",
			attributeGroupMember:     "member",
			disableLogout: false,
			defaultPermissionAddSpace: false
		};
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let provider = this.get('authProvider');
		let constants = this.get('constants');

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

			case constants.AuthProvider.LDAP: // eslint-disable-line no-case-declarations
				let ldapConfig = this.get('authConfig');

				if (is.undefined(ldapConfig) || is.null(ldapConfig) || is.empty(ldapConfig) ) {
					ldapConfig = {};
				} else {
					ldapConfig.defaultPermissionAddSpace = ldapConfig.hasOwnProperty('defaultPermissionAddSpace') ? ldapConfig.defaultPermissionAddSpace : false;
					ldapConfig.disableLogout = ldapConfig.hasOwnProperty('disableLogout') ? ldapConfig.disableLogout : true;
				}

				this.set('ldapConfig', ldapConfig);
				break;
		}
	},

	actions: {
		onDocumize() {
			let constants = this.get('constants');
			this.set('authProvider', constants.AuthProvider.Documize);
		},

		onKeycloak() {
			let constants = this.get('constants');
			this.set('authProvider', constants.AuthProvider.Keycloak);
		},

		onLDAP() {
			let constants = this.get('constants');
			this.set('authProvider', constants.AuthProvider.LDAP);
		},

		onLDAPEncryption(e) {
			this.set('ldapConfig.encryptionType', e);
		},

		onLDAPPreview() {
			this.showWait();

			let config = this.get('ldapConfig');
			config.serverPort = parseInt(this.get('ldapConfig.serverPort'));

			this.get('globalSvc').previewLDAP(config).then((preview) => {
				this.set('ldapPreview', preview);
				this.modalOpen("#ldap-preview-modal", {"show": true});
				this.showDone();
			});
		},

		onSave() {
			let constants = this.get('constants');
			let provider = this.get('authProvider');
			let config = this.get('authConfig');

			this.set('keycloakFailure', '');

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

					config = copy(this.get('keycloakConfig'));
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

					set(config, 'publicKey', encoding.Base64.encode(this.get('keycloakConfig.publicKey')));
					break;

				case constants.AuthProvider.LDAP:
					if (this.get('ldapErrorServerHost')) {
						this.$("#ldap-host").focus();
						return;
					}
					if (this.get('ldapErrorServerPort')) {
						this.$("#ldap-port").focus();
						return;
					}

					config = copy(this.get('ldapConfig'));
					config.serverHost = config.serverHost.trim();
					config.serverPort = parseInt(this.get('ldapConfig.serverPort'));
					break;
			}

			debugger;

			this.showWait();

			let data = { authProvider: provider, authConfig: JSON.stringify(config) };

			this.get('onSave')(data).then(() => {
				// Without sync we cannot log in
				if (data.authProvider === constants.AuthProvider.Keycloak) {
					this.get('onSync')().then((response) => {
						if (response.isError) {
							this.set('keycloakFailure', response.message);
							console.log(response.message); // eslint-disable-line no-console
							data.authProvider = constants.AuthProvider.Documize;
							this.get('onSave')(data).then(() => {});
						} else {
							if (data.authProvider === this.get('appMeta.authProvider')) {
								console.log(response.message); // eslint-disable-line no-console
							} else {
								this.get('onChange')(data);
							}
						}
					});
				}

				this.showDone();
			});
		}
	}
});
