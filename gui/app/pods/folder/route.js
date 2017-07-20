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
	documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),
	session: Ember.inject.service(''),
	folder: {},

	beforeModel() {
		this.set('folderId', this.paramsFor('folder').folder_id)

		return new Ember.RSVP.Promise((resolve) => {
			this.get('folderService').getFolder(this.get('folderId')).then((folder) => {
				this.set('folder', folder);

				this.get('folderService').setCurrentFolder(folder).then(() => {
					this.set('isEditor', this.get('folderService').get('canEditCurrentFolder'));
					this.set('isFolderOwner', this.get('session.user.id') === folder.get('userId'));

					resolve();
				});
			});
		});
	},

	model(params) {
		return Ember.RSVP.hash({
			folder: this.get('folder'),
			isEditor: this.get('isEditor'),
			isFolderOwner: this.get('isFolderOwner'),
			folders: this.get('folderService').getAll(),
			documents: this.get('documentService').getAllByFolder(params.folder_id)
		});
	},

	setupController(controller, model) {
		controller.set('model', model);
		this.browser.setTitle(model.folder.get('name'));
	},

	actions: {
		error(error /*, transition*/ ) {
			console.log(error); // eslint-disable-line no-console
			if (error) {
				this.transitionTo('/not-found');
				return false;
			}
		}
	}
});
