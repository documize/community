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
import constants from '../../../utils/constants';

export default Ember.Route.extend({
	session: Ember.inject.service(),
	appMeta: Ember.inject.service(),
	kcAuth: Ember.inject.service(),
	localStorage: Ember.inject.service(),
	queryParams: {
		mode: {
			refreshModel: true
		}
	},
	message: '',

	beforeModel(transition) {
		return new Ember.RSVP.Promise((resolve) => {
			this.set('mode', is.not.undefined(transition.queryParams.mode) ? transition.queryParams.mode : 'reject');

			if (this.get('mode') === 'reject' || this.get('appMeta.authProvider') !== constants.AuthProvider.Keycloak) {
				resolve();
			}

			this.get('kcAuth').fetchProfile().then((profile) => {
				let data = this.get('kcAuth').mapProfile(profile);

				this.get("session").authenticate('authenticator:keycloak', data).then(() => {
					this.transitionTo('folders');
				}, (reject) => {
					this.set('message', reject.Error);
					this.set('mode', 'reject');
					resolve();
				});

			}, (reject) => {
				this.set('mode', 'reject');
				this.set('message', reject);
				resolve();
			});
		});
	},

	model() {
		return {
			mode: this.get('mode'),
			message: this.get('message')
		}
	}
});
