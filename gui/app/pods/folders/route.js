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

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	appMeta: service(),
	folderService: service('folder'),
	localStorage: service(),

	beforeModel() {
		if (this.get('appMeta.setupMode')) {
			this.get('localStorage').clearAll();
			this.transitionTo('setup');
		}
	},

	model() {
		return this.get('folderService').getAll();
	},

	setupController(controller, model) {
		this._super(controller, model);
		controller.set('selectedSpaces', model);

		let constants = this.get('constants');
		let publicSpaces = [];
		let protectedSpaces = [];
		let personalSpaces = [];

		_.each(model, space => {
			if (space.get('spaceType') === constants.SpaceType.Public) {
				publicSpaces.pushObject(space);
			}
			if (space.get('spaceType') === constants.SpaceType.Private) {
				personalSpaces.pushObject(space);
			}
			if (space.get('spaceType') === constants.SpaceType.Protected) {
				protectedSpaces.pushObject(space);
			}
		});

		controller.set('publicSpaces', publicSpaces);
		controller.set('protectedSpaces', protectedSpaces);
		controller.set('personalSpaces', personalSpaces);
	},

	activate() {
		this.get('browser').setTitle('Spaces');
	}
});
