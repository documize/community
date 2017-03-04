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
		pageId: {
			refreshModel: false
		}
	},

	beforeModel(transition) {
		this.set('pageId', is.not.undefined(transition.queryParams.pageId) ? transition.queryParams.pageId : '');
	},

	model() {
		let document = this.modelFor('document').document;
		this.browser.setTitle(document.get('name'));
		this.browser.setMetaDescription(document.get('excerpt'));

		return Ember.RSVP.hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			pageId: this.get('pageId'),
			isEditor: this.get('folderService').get('canEditCurrentFolder'),
			pages: this.modelFor('document').pages,
			links: this.modelFor('document').links,
			sections: this.modelFor('document').sections
		});
	}
});
