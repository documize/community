/* eslint-disable ember/no-classic-classes */
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
import { Promise as EmberPromise } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    appMeta: service(),
	kcAuth: service(),
	global: service(),
	localStorage: service(),
	showLogin: false,

	beforeModel(transition) {
		return new EmberPromise((resolve) => {
			let constants = this.get('constants');

			let authProvider = this.get('appMeta.authProvider');

			switch (authProvider) {
				case constants.AuthProvider.Keycloak:
					this.set('showLogin', false);

					this.get('kcAuth').login().then(() => {
						this.transitionTo('auth.keycloak', { queryParams: { mode: 'login' }});
						resolve();
					}, (reject) => {
						transition.abort();
						console.log (reject); // eslint-disable-line no-console
						this.transitionTo('auth.keycloak', { queryParams: { mode: 'reject' }});
					});

					break;
				case constants.AuthProvider.CAS: {
					let config = JSON.parse(this.get('appMeta.authConfig'));
					let url = config.url + '/login?service=' + encodeURIComponent(config.redirectUrl);
					window.location.replace(url);
					resolve();
					break;
				}

				default:
					this.set('showLogin', true);
					resolve();
					break;
			}
		});
	},

	model() {
		return  {
			showLogin: this.get('showLogin')
		};
	},

	setupController: function (controller, model) {
		this._super(controller, model);

		controller.set('model', model);
		controller.reset();
	},

	activate() {
		this.get('browser').setTitleAsPhrase('Login');
		$('body').addClass('background-color-theme-100 d-flex justify-content-center align-items-center');
	},

	deactivate() {
		$('body').removeClass('background-color-theme-100 d-flex justify-content-center align-items-center');
	}
});
