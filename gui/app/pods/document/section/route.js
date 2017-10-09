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

	model(params) {
		return Ember.RSVP.hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			permissions: this.get('folderService').get('permissions'),
			links: this.modelFor('document').links,
			sections: this.modelFor('document').sections,
			page: this.get('documentService').getPage(this.modelFor('document').document.get('id'), params.page_id),
			meta: this.get('documentService').getPageMeta(this.modelFor('document').document.get('id'), params.page_id)
		});
	},

	activate() {
		$('body').addClass('background-color-off-white');
	},

	deactivate() {
		$('body').removeClass('background-color-off-white');
	}
});
