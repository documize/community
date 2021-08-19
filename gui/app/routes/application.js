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
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import netUtil from '../utils/net';
import Route from '@ember/routing/route';

export default Route.extend(ApplicationRouteMixin, {
	appMeta: service(),
	session: service(),
	pinned: service(),
	localStorage: service(),

	beforeModel(transition) {
		this._super(...arguments);

		let sa = this.get('session.session.authenticator');

		return this.get('appMeta').boot(transition.targetName, '').then(data => {
			if (sa !== "authenticator:documize" && sa !== "authenticator:keycloak" && sa !== "authenticator:ldap" && sa != "authenticator:cas" && data.allowAnonymousAccess) {
				if (!this.get('appMeta.setupMode') && !this.get('appMeta.secureMode')) {
					return this.get('session').authenticate('authenticator:anonymous', data);
				}
			}
		});
	},

	sessionAuthenticated() {
		if (this.get('appMeta.setupMode') || this.get('appMeta.secureMode')) {
			this.get('localStorage').clearAll();
			return;
		}

		let next = this.get('localStorage').getSessionItem('entryUrl');

		if (!_.isNull(next) && !_.isUndefined(next)) {
			this.get('localStorage').clearSessionItem('entryUrl')

			if (!_.includes(next, '/auth/')) {
				// window.location.href= next;
			}
		}
	},

	actions: {
		willTransition: function( /*transition*/ ) {
			Mousetrap.reset();
		},

		error(error, transition) {
			if (error) {
				console.log(error); // eslint-disable-line no-console
				console.log(transition); // eslint-disable-line no-console

				if (netUtil.isAjaxAccessError(error) && !this.get('appMeta.setupMode')) {
					this.get('localStorage').clearAll();
					return this.transitionTo('auth.login');
				}
			}

			return true; // bubble this event to any parent route
		}
	}
});
