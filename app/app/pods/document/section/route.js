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
	pageId: '',
	queryParams: {
		mode: {
			refreshModel: false
		}
	},

	beforeModel(transition) {
		this.set('mode', !_.isUndefined(transition.queryParams.mode) ? transition.queryParams.mode : '');
	},

	model(params) {
		let self = this;
		let document = this.modelFor('document');
		let folders = this.get('store').peekAll('folder');
		let folder = this.get('store').peekRecord('folder', this.paramsFor('document').folder_id);

		let pages = this.get('store').peekAll('page').filter((page) => {
			return page.get('documentId') === document.get('id') && page.get('pageType') === 'section';
		});

		let tabs = this.get('store').peekAll('page').filter((page) => {
			return page.get('documentId') === document.get('id') && page.get('pageType') === 'tab';
		});

		let page = tabs.findBy('id', params.page_id);

		this.audit.record("viewed-document-section-" + page.get('contentType'));

		return Ember.RSVP.hash({
			folders: folders,
			folder: folder,
			document: document,
			pages: pages,
			page: page,
			meta: self.get('documentService').getPageMeta(document.get('id'), params.page_id)
		});
	},
});
