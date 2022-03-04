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

import $ from 'jquery';
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
	i18n: service(),

	isDocumizeProvider: computed('authProvider', function() {
		return this.get('authProvider') === this.get('constants').AuthProvider.Documize;
	}),
	isKeycloakProvider: computed('authProvider', function() {
		return this.get('authProvider') === this.get('constants').AuthProvider.Keycloak;
	}),
	isLDAPProvider: computed('authProvider', function() {
		return this.get('authProvider') === this.get('constants').AuthProvider.LDAP;
	}),
	isCASProvider: computed('authProvider', function(){
		return this.get('authProvider') === this.get('constants').AuthProvider.CAS;
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
		return _.isEmpty(this.get('ldapConfig.serverPort')) || !_.isNumber(parseInt(this.get('ldapConfig.serverPort')));
	}),
	ldapErrorBindDN: empty('ldapConfig.bindDN'),
	ldapErrorBindPassword: empty('ldapConfig.bindPassword'),
	ldapErrorNoFilter: computed('ldapConfig.{userFilter,groupFilter}', function() {
		return _.isEmpty(this.get('ldapConfig.userFilter')) && _.isEmpty(this.get('ldapConfig.groupFilter'));
	}),
	ldapErrorAttributeUserRDN: empty('ldapConfig.attributeUserRDN'),
	ldapErrorAttributeUserFirstname: empty('ldapConfig.attributeUserFirstname'),
	ldapErrorAttributeUserLastname: empty('ldapConfig.attributeUserLastname'),
	ldapErrorAttributeUserEmail: empty('ldapConfig.attributeUserEmail'),
	ldapErrorAttributeGroupMember: computed('ldapConfig.{groupFilter,attributeGroupMember}', function() {
		return !_.isEmpty(this.get('ldapConfig.groupFilter')) && _.isEmpty(this.get('ldapConfig.attributeGroupMember'));
	}),
	ldapPreview: null,
	ldapConfig: null,

	casErrorUrl: empty('casConfig.url'),
	casErrorRedirectUrl: empty('casConfig.redirectUrl'),
	casConfig:null,

	init() {
		this._super(...arguments);

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
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let provider = this.get('authProvider');
		let constants = this.get('constants');

		this.set('ldapPreview', {isError: true, message: this.i18n.localize('auth_ldap_preview_error')});

		switch (provider) {
			case constants.AuthProvider.Documize: {
				// nothing to do
				break;
			}

			case constants.AuthProvider.Keycloak: {
				let config = this.get('authConfig');

				if (_.isUndefined(config) || _.isNull(config) || _.isEmpty(config) ) {
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

			case constants.AuthProvider.LDAP: {
				let ldapConfig = this.get('authConfig');

				if (_.isUndefined(ldapConfig) || _.isNull(ldapConfig) || _.isEmpty(ldapConfig) ) {
					ldapConfig = {};
				} else {
					ldapConfig = JSON.parse(ldapConfig);
					ldapConfig.defaultPermissionAddSpace = ldapConfig.hasOwnProperty('defaultPermissionAddSpace') ? ldapConfig.defaultPermissionAddSpace : false;
					ldapConfig.disableLogout = ldapConfig.hasOwnProperty('disableLogout') ? ldapConfig.disableLogout : true;
					ldapConfig.allowFormsAuth = ldapConfig.hasOwnProperty('allowFormsAuth') ? ldapConfig.allowFormsAuth : false;
				}

				this.set('ldapConfig', ldapConfig);
				break;
			}
			case constants.AuthProvider.CAS: {
				let casConfig = this.get('authConfig');
				if (_.isUndefined(casConfig) || _.isNull(casConfig) || _.isEmpty(casConfig) ) {
					casConfig = {};
				} else {
					casConfig = JSON.parse(casConfig);
					casConfig.url = casConfig.hasOwnProperty('url') ? casConfig.url : '';
					casConfig.redirectUrl = casConfig.hasOwnProperty('redirectUrl') ? casConfig.redirectUrl : '';
				}

				this.set('casConfig', casConfig);
				break;
			}
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
		onCAS() {
			let constants = this.get('constants');
			this.set('authProvider', constants.AuthProvider.CAS);
		},

		onLDAPEncryption(e) {
			this.set('ldapConfig.encryptionType', e);
		},

		onLDAPPreview() {
			let config = this.get('ldapConfig');
			config.serverPort = parseInt(this.get('ldapConfig.serverPort'));

			this.get('globalSvc').previewLDAP(config).then((preview) => {
				this.set('ldapPreview', preview);
				this.modalOpen("#ldap-preview-modal", {"show": true});
				this.notifySuccess(this.i18n.localize('saved'));
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
						$("#keycloak-url").focus();
						return;
					}
					if (this.get('KeycloakRealmError')) {
						$("#keycloak-realm").focus();
						return;
					}
					if (this.get('KeycloakClientIdError')) {
						$("#keycloak-clientId").focus();
						return;
					}
					if (this.get('KeycloakPublicKeyError')) {
						$("#keycloak-publicKey").focus();
						return;
					}
					if (this.get('KeycloakAdminUserError')) {
						$("#keycloak-admin-user").focus();
						return;
					}
					if (this.get('KeycloakAdminPasswordError')) {
						$("#keycloak-admin-password").focus();
						return;
					}

					config = copy(this.get('keycloakConfig'));
					config.url = config.url.trim();
					config.realm = config.realm.trim();
					config.clientId = config.clientId.trim();
					config.publicKey = config.publicKey.trim();
					config.group = _.isUndefined(config.group) ? '' : config.group.trim();
					config.adminUser = config.adminUser.trim();
					config.adminPassword = config.adminPassword.trim();
					config.defaultPermissionAddSpace = config.hasOwnProperty('defaultPermissionAddSpace') ? config.defaultPermissionAddSpace : true;
					config.disableLogout = config.hasOwnProperty('disableLogout') ? config.disableLogout : true;

					if (_.endsWith(config.url, '/')) {
						config.url = config.url.substring(0, config.url.length-1);
					}

					set(config, 'publicKey', encoding.Base64.encode(this.get('keycloakConfig.publicKey')));
					break;

				case constants.AuthProvider.LDAP:
					if (this.get('ldapErrorServerHost')) {
						$("#ldap-host").focus();
						return;
					}
					if (this.get('ldapErrorServerPort')) {
						$("#ldap-port").focus();
						return;
					}

					config = copy(this.get('ldapConfig'));
					config.serverHost = config.serverHost.trim();
					config.serverPort = parseInt(this.get('ldapConfig.serverPort'));

					if (!_.isEmpty(config.groupFilter) && _.isEmpty(config.attributeGroupMember)) {
						$('#ldap-attributeGroupMember').focus();
						return;
					}

					break;
				case constants.AuthProvider.CAS:
					if (this.get('casErrorUrl')) {
						$("#cas-url").focus();
						return;
					}
					if (this.get('casErrorRedirectUrl')) {
						$("#cas-redirect-url").focus();
						return;
					}

					config = copy(this.get('casConfig'));
					config.url = config.url.trim();
					config.redirectUrl = config.redirectUrl.trim();

					break;
			}

			let data = { authProvider: provider, authConfig: JSON.stringify(config) };

			this.get('onSave')(data).then(() => {
				// Without sync we cannot log in

				// Keycloak sync process
				if (data.authProvider === constants.AuthProvider.Keycloak) {
					this.get('onSyncKeycloak')().then((response) => {
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

				// LDAP sync process
				if (data.authProvider === constants.AuthProvider.LDAP) {
					this.get('onSyncLDAP')().then((response) => {
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

				this.notifySuccess(this.i18n.localize('saved'));
			});
		}
	}
});
