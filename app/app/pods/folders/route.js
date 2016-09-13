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
import { isNotFoundError } from 'ember-ajax/errors';

const {
	isPresent
} = Ember;

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	folderService: Ember.inject.service('folder'),
	localStorage: Ember.inject.service(),
	folder: {},

	model: function () {
		return this.get('folderService').getAll();
	},

	afterModel: function (model) {

		let params = this.paramsFor('folders.folder');

		if (is.empty(params)) {
			let lastFolder = this.get('localStorage').getSessionItem("folder");
			let self = this;

			//If folder lastFolder is defined
			if (isPresent(lastFolder)) {
				return this.get('folderService').getFolder(lastFolder).then((folder) => {
					//if Response is null or undefined redirect to login else transitionTo dashboard
					if (Ember.isNone(folder)) {
						self.get('localStorage').clearSessionItem("folder");
						this.transitionTo('application');
					}

					Ember.set(this, 'folder', folder);
					this.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
				}).catch(() => {
					//if there was an error redirect to login
					self.get('localStorage').clearSessionItem("folder");
					this.transitionTo('application');
				});
			}

			// If model has any folders redirect to dashboard
			if (model.get('length') > 0) {
				let folder = model[0];
				Ember.set(this, 'folder', folder);
				this.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
			}
		}

		//If folder route has params
		if (isPresent(params)) {
			let self = this;
			let folderId = this.paramsFor('folders.folder').folder_id;

			return this.get('folderService').getFolder(folderId).then((folder) => {
				Ember.set(this, 'folder', folder);
			}).catch(function (error) {
				if (isNotFoundError(error)) {
					// handle 404 errors here
					self.transitionTo('application');
				}
			});
		}

		this.browser.setMetaDescription();
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set('folder', this.folder);
	}
});
