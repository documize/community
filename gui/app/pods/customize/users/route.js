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
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	userService: service('user'),
	appMeta: service(),
	i18n: service(),

	beforeModel () {
		if (!this.session.isAdmin) {
			this.transitionTo('auth.login');
		}
	},

	model() {
		return new EmberPromise((resolve) => {
			this.get('userService').getComplete('', 100).then((users) => {
				resolve(users);
			});
		});
	},

	activate() {
		this.get('browser').setTitle(this.i18n.localize('admin_user_management'));
	}
});
