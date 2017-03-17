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
    appMeta: Ember.inject.service(),
	kcAuth: Ember.inject.service(),
	localStorage: Ember.inject.service(),
	showLogin: false,

	beforeModel(/*transition*/) {
		let authProvider = this.get('appMeta.authProvider');
		let authConfig = this.get('appMeta.authConfig');

		switch (authProvider) {
			case constants.AuthProvider.Keycloak:
				this.set('showLogin', false);

				this.get('kcAuth').boot(JSON.parse(authConfig)).then(() => {
					this.get('kcAuth').login().then(() => {
					}, (reject) => {
						this.get('localStorage').storeSessionItem('kc-error', reject);
						this.transitionTo('auth.keycloak', { queryParams: { mode: 'reject' }});
					});
				}, (reject) => {
					this.get('localStorage').storeSessionItem('kc-error', reject);
					this.transitionTo('auth.keycloak', { queryParams: { mode: 'reject' }});
				});

				break;
				
			default:
				this.set('showLogin', true);
				break;
		}
	},

	model() {
		return  {
			showLogin: this.get('showLogin')
		};
	},

	setupController: function (controller, model) {
		controller.set('model', model);
		controller.reset();
		this.browser.setTitleAsPhrase("Login");
	},

	activate() {
		$('body').addClass('background-color-off-white');
	},

	deactivate() {
		$('body').removeClass('background-color-off-white');
	}
});