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
	userService: Ember.inject.service('user'),
	pages: [],

	model() {
		this.audit.record("viewed-document-activity");

		let folders = this.get('store').peekAll('folder');
		let folder = this.get('store').peekRecord('folder', this.paramsFor('document').folder_id);

		this.set('folders', folders);
		this.set('folder', folder);

		return this.modelFor('document');
	},

	afterModel(model) {
		let self = this;

		let pages = this.get('store').peekAll('page').filter((page) => {
			return page.get('documentId') === model.get('id');
		});

		this.set('pages', pages);

		return new Ember.RSVP.Promise(function (resolve) {
			self.get('documentService').getMeta(model.get('id')).then(function (activity) {
				self.set('activity', activity);
				resolve();
			});
		});
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set('folder', this.get('folder'));
		controller.set('folders', this.get('folders').rejectBy('id', 0));
		controller.set('isEditor', this.get('folderService').get('canEditCurrentFolder'));
		controller.set('activity', this.get('activity'));
		controller.set('pages', this.get('pages'));
	}
});
