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

export default Route.extend({
	session: service(),
	appMeta: service(),
	kcAuth: service(),
	localStorage: service(),

	queryParams: {
		mode: {
			refreshModel: true
		}
	},
	message: '',

	beforeModel(transition) {
		return new EmberPromise((resolve) => {
			let constants = this.get('constants');

			this.set('mode', !_.isUndefined(transition.to.queryParams.mode) ? transition.to.queryParams.mode : 'reject');

			if (this.get('mode') === 'reject' || this.get('appMeta.authProvider') !== constants.AuthProvider.Keycloak) {
				resolve();
			}

			this.get('kcAuth').fetchProfile().then((profile) => {
				let data = this.get('kcAuth').mapProfile(profile);

				this.get("session").authenticate('authenticator:keycloak', data).then(() => {
					this.transitionTo('folders');
				}, (reject) => {
					if (!_.isUndefined(reject.Error)) {
						this.set('message', reject.Error);
					} else {
						this.set('message', reject);
					}
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
