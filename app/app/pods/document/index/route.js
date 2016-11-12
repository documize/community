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
	queryParams: {
		page: {
			refreshModel: false
		}
	},

	beforeModel(transition) {
		this.set('pageId', is.not.undefined(transition.queryParams.page) ? transition.queryParams.page : "");
		this.set('folderId', this.paramsFor('document').folder_id);
		this.set('documentId', this.paramsFor('document').document_id);

		let folders = this.get('store').peekAll('folder');
		let folder = this.get('store').peekRecord('folder', this.get('folderId'));
		let document = this.get('store').peekRecord('document', this.get('documentId'));

		this.set('document', document);
		this.set('folders', folders);
		this.set('folder', folder);
	},

	model() {
		this.browser.setTitle(this.get('document.name'));
		this.browser.setMetaDescription(this.get('document.excerpt'));

		let self = this;

		return Ember.RSVP.hash({
			folders: self.get('folders'),
			folder: self.get('folder'),
			document: self.get('document'),
			page: self.get('pageId'),
			isEditor: self.get('folderService').get('canEditCurrentFolder'),
			pages: self.get('documentService').getPages(self.get('documentId')).then(function (pages) {
				return pages.filterBy('pageType', 'section');
			})
		});
	}
});
