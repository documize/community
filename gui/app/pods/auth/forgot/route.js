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
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    appMeta: service(),

	beforeModel() {
		let constants = this.get('constants');

		if (this.get('appMeta.authProvider') !== constants.AuthProvider.Documize) {
			this.transitionTo('auth.login');
		}
	},

	setupController(controller, model) {
		this._super(controller, model);

		controller.set('model', model);
		controller.set('sayThanks', false);
	},

	activate() {
		this.get('browser').setTitleAsPhrase('Forgot Password');
		$('body').addClass('background-color-theme-100 d-flex justify-content-center align-items-center');
	},

	deactivate() {
		$('body').removeClass('background-color-theme-100 d-flex justify-content-center align-items-center');
	}
});
