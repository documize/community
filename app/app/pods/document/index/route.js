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
	linkService: Ember.inject.service('link'),
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

		return new Ember.RSVP.Promise((resolve) => {
			this.get('documentService').getPages(this.get('documentId')).then((pages) => {
				this.set('allPages', pages);
				this.set('pages', pages.filterBy('pageType', 'section'));
				this.set('tabs', pages.filterBy('pageType', 'tab'));
				resolve();
			});
		});

	},

	model() {
		this.browser.setTitle(this.get('document.name'));
		this.browser.setMetaDescription(this.get('document.excerpt'));

		return Ember.RSVP.hash({
			folders: this.get('folders'),
			folder: this.get('folder'),
			document: this.get('document'),
			page: this.get('pageId'),
			isEditor: this.get('folderService').get('canEditCurrentFolder'),
			allPages: this.get('allPages'),
			pages: this.get('pages'),
			tabs: this.get('tabs'),
			links: this.get('linkService').getDocumentLinks(this.get('documentId'))
		});
	}
});
