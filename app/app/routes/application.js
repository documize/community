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

const {
	inject: { service }
} = Ember;

export default Ember.Route.extend(ApplicationRouteMixin, {
	appMeta: service(),
	session: service(),

	beforeModel(transition) {
		return this.get('appMeta').boot(transition.targetName).then(data => {
			if (this.get('session.session.authenticator') !== "authenticator:documize" && data.allowAnonymousAccess) {
				return this.get('session').authenticate('authenticator:anonymous', data);
			}

			return;
		});
	},

	actions: {
		willTransition: function( /*transition*/ ) {
			Mousetrap.reset();
		},

		error(error /*, transition*/ ) {
			if (error) {
				if (netUtil.isAjaxAccessError(error)) {
					localStorage.clear();
					return this.transitionTo('auth.login');
				}
			}

			// Return true to bubble this event to any parent route.
			return true;
		}
	}
});
