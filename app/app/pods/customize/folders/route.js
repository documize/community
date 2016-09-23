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
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	folderService: Ember.inject.service('folder'),

	beforeModel() {
		if (!this.session.isAdmin) {
			this.transitionTo('auth.login');
		}
	},

	model() {
		return this.get('folderService').getAll();
	},

	setupController(controller, model) {
		let nonPrivateFolders = model.rejectBy('folderType', 2);
		controller.set('folders', nonPrivateFolders);

		this.get('folderService').getProtectedFolderInfo().then((people) => {
			people.forEach((person) => {
				person.set('isEveryone', person.get('userId') === '');
				person.set('isOwner', false);
			});

			nonPrivateFolders.forEach(function (folder) {
				let shared = people.filterBy('folderId', folder.get('id'));
				let person = shared.findBy('userId', folder.get('userId'));
				if (is.not.undefined(person)) {
					person.set('isOwner', true);
				}

				folder.set('sharedWith', shared);
			});
		});
	},

	activate() {
		document.title = "Folders | Documize";
	},

	actions: {
		onChangeOwner() {
			this.refresh();
		}
	}
});
