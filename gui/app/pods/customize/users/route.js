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
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	userService: service('user'),
	global: service('global'),
	appMeta: service(),

	beforeModel () {
		if (!this.session.isAdmin) {
			this.transitionTo('auth.login');
		}
	},

	model() {
		return new EmberPromise((resolve) => {
			let constants = this.get('constants');

			if (this.get('appMeta.authProvider') == constants.AuthProvider.Keycloak) {
				this.get('global').syncExternalUsers().then(() => {
					this.get('userService').getComplete('').then((users) =>{
						resolve(users);
					});
				});
			} else {
				this.get('userService').getComplete('').then((users) => {
					resolve(users);
				});
			}
		});
	},

	activate() {
		this.get('browser').setTitle('Users');
	}
});
