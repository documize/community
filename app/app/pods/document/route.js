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
	sectionService: Ember.inject.service('section'),
	documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),
	userService: Ember.inject.service('user'),
	pages: [],
	users: [],
	meta: [],
	folder: null,

	beforeModel(transition) {
		this.pageId = is.not.undefined(transition.queryParams.page) ? transition.queryParams.page : "";
		var self = this;

		this.get('folderService').getAll().then(function (folders) {
			self.set('folders', folders);
			self.set('folder', folders.findBy("id", self.paramsFor('document').folder_id));
			self.get('folderService').setCurrentFolder(self.get('folder'));
		});
	},

	model: function (params) {
		// this.audit.record("viewed-document");
		return this.get('documentService').getDocument(params.document_id);
	},

	afterModel(model) {
		var self = this;
		var documentId = model.get('id');

		this.browser.setTitle(model.get('name'));

		return new Ember.RSVP.Promise(function (resolve) {
			self.get('documentService').getPages(documentId).then(function (pages) {
				self.set('allPages', pages);

				self.get('sectionService').getAll().then(function (sections) {
					self.set('sections', sections.filterBy('pageType', 'section'));
					resolve();
				});
			});
		});
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set('folder', this.folder);
		controller.set('folders', this.get('folders').rejectBy('id', 0));
		controller.set('currentPage', this.pageId);
		controller.set('isEditor', this.get('folderService').get('canEditCurrentFolder'));
		controller.set('pages', this.get('allPages').filterBy('pageType', 'section'));
		controller.set('tabs', this.get('allPages').filterBy('pageType', 'tab'));
		controller.set('sections', this.get('sections'));

		// setup document owner
		let owner = this.get('users').findBy('id', model.get('userId'));

		// no document owner? You are the owner!
		if (is.undefined(owner)) {
			owner = this.session.user;
			model.set('userId', this.get('session.session.authenticated.user.id'));
			this.get('documentService').save(model);
		}

		controller.set('owner', owner);

		this.browser.setMetaDescription(model.get('excerpt'));
	},

	actions: {
		error(error /*, transition*/ ) {
			console.log(error);
			if (error) {
				this.transitionTo('/not-found');
				return false;
			}
		}
	}
});
