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
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	userService: service('user'),
	folderService: service('folder'),
	session: service(),

	beforeModel: function () {
		if (!this.get("session.authenticated")) {
			this.transitionTo('auth.login');
		}
	},

	model: function () {
		return this.get('userService').getUser(this.get("session.session.authenticated.user.id"));
	},

	afterModel: function (model) {
		this.browser.setTitleWithoutSuffix(model.get('fullname'));
	},

	setupController(controller, model) {
		this._super(controller, model);

		controller.set('model', model);
		controller.set("folder", this.get('folderService.currentFolder'));
	}
});
