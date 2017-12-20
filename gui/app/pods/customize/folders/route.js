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
	folderService: service('folder'),

	beforeModel() {
		if (!this.session.isAdmin) {
			this.transitionTo('auth.login');
		}
	},

	model() {
		return this.get('folderService').adminList();
	},

	setupController(controller, model) {
		let nonPrivateFolders = model.rejectBy('folderType', 2);
		if (is.empty(nonPrivateFolders) || is.null(model) || is.undefined(model)) {
			nonPrivateFolders = [];
		}

		controller.set('folders', nonPrivateFolders);

	},

	activate() {
		document.title = "Spaces | Documize";
	}
});
