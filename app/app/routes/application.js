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
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import netUtil from '../utils/net';
import TooltipMixin from '../mixins/tooltip';

const {
	inject: { service }
} = Ember;

export default Ember.Route.extend(ApplicationRouteMixin, TooltipMixin, {
	appMeta: service(),
	session: service(),
	pinned: service(),
	localStorage: service(),

	beforeModel(transition) {
		this._super(...arguments);

		let sa = this.get('session.session.authenticator');

		return this.get('appMeta').boot(transition.targetName, window.location.href).then(data => {
			if (sa !== "authenticator:documize" && sa !== "authenticator:keycloak" && data.allowAnonymousAccess) {
				return this.get('session').authenticate('authenticator:anonymous', data);
			}

			return;
		});
	},

	sessionAuthenticated() {
		let next = this.get('localStorage').getSessionItem('entryUrl');
		if (is.not.null(next) && is.not.undefined(next)) {
			this.get('localStorage').clearSessionItem('entryUrl')

			if (is.not.include(next, '/auth/')) {
				window.location.href= next;
			}
		}
	},

	actions: {
		willTransition: function( /*transition*/ ) {
			Mousetrap.reset();
			this.destroyTooltips();
		},

		error(error, transition) {
			if (error) {
				console.log(error); // eslint-disable-line no-console
				console.log(transition); // eslint-disable-line no-console

				if (netUtil.isAjaxAccessError(error)) {
					localStorage.clear();
					return this.transitionTo('auth.login');
				}
			}

			return true; // bubble this event to any parent route
		}
	}
});
