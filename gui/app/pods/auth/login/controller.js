/* eslint-disable ember/no-actions-hash */
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

import { inject as service } from '@ember/service';
import AuthProvider from '../../../mixins/auth';
import Controller from '@ember/controller';

export default Controller.extend(AuthProvider, {
	appMeta: service('app-meta'),
	session: service('session'),

	invalidCredentials: false,

	reset() {
		if (this.get('isAuthProviderDocumize')) {
			this.setProperties({
				email: '',
				password: ''
			});
		}

		if (this.get('isAuthProviderLDAP') || this.get('isAuthProviderCAS')) {
			this.setProperties({
				username: '',
				password: ''
			});
		}

		let dbhash = document.head.querySelector("[property=dbhash]").content;
		if (dbhash.length > 0 && dbhash !== "{{.DBhash}}") {
			this.transitionToRoute('setup');
		}
	},

	actions: {
		login() {
			if (this.get('isAuthProviderDocumize')) {
				let creds = this.getProperties('email', 'password');

				this.get('session').authenticate('authenticator:documize', creds).then((response) => {
					this.transitionToRoute('folders');
					return response;
				}).catch(() => {
					this.set('invalidCredentials', true);
				});
			}

			if (this.get('isAuthProviderLDAP')) {
				let creds = this.getProperties('username', 'password');

				this.get('session').authenticate('authenticator:ldap', creds).then((response) => {
					this.transitionToRoute('folders');
					return response;
				}).catch(() => {
					this.set('invalidCredentials', true);
				});
			}
		}
	}
});
