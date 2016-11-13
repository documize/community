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

	model(params) {
		let self = this;

		this.audit.record("edited-page");

		return Ember.RSVP.hash({
			folder: self.modelFor('document').folder,
			document: self.modelFor('document').document,
			page: self.get('documentService').getPage(self.paramsFor('document').document_id, params.page_id),
			meta: self.get('documentService').getPageMeta(self.paramsFor('document').document_id, params.page_id)
		});
	}
});
