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

import { Promise as EmberPromise } from 'rsvp';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {
	appMeta: service(),
	session: service(),
	global: service(),
	i18n: service(),

	beforeModel() {
		if (!this.get("session.isGlobalAdmin")) {
			this.transitionTo('auth.login');
		}
	},

	model() {
		let constants = this.get('constants');

		let data = {
			authProvider: this.get('appMeta.authProvider'),
			authConfig: null,
		};

		return new EmberPromise((resolve) => {
			this.get('global').getAuthConfig().then((config) => {
				switch (data.authProvider) {
					case constants.AuthProvider.Keycloak:
						data.authConfig = config;
						break;
					case constants.AuthProvider.LDAP:
						data.authConfig = config;
						break;
					case constants.AuthProvider.CAS:
						data.authConfig = config;
						break;
					case constants.AuthProvider.Documize:
						data.authConfig = '';
						break;
				}

				resolve(data);
			});
		});
	},

	activate() {
		this.get('browser').setTitle(this.i18n.localize('authentication'));
	}
});
