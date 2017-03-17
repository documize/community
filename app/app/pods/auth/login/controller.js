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
// import constants from '../../../utils/constants';

export default Ember.Controller.extend({
	appMeta: Ember.inject.service('app-meta'),
	invalidCredentials: false,
	session: Ember.inject.service('session'),
	audit: Ember.inject.service('audit'),

	reset() {
		this.setProperties({
			email: '',
			password: ''
		});

		let dbhash = document.head.querySelector("[property=dbhash]").content;
		if (dbhash.length > 0 && dbhash !== "{{.DBhash}}") {
			this.transitionToRoute('setup');
		}

	},

	actions: {
		login() {
			let creds = this.getProperties('email', 'password');

			this.get('session').authenticate('authenticator:documize', creds)
				.then((response) => {
					this.get('audit').record("logged-in");
					this.transitionToRoute('folders');
					return response;
				}).catch(() => {
					this.set('invalidCredentials', true);
				});
		}
	}
});
