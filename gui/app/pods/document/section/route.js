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

import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {
	documentService: service('document'),
	folderService: service('folder'),
	userService: service('user'),

	model(params) {
		return hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			permissions: this.get('folderService').get('permissions'),
			links: this.modelFor('document').links,
			sections: this.modelFor('document').sections,
			attachments: this.modelFor('document').attachments,
			page: this.get('documentService').getPage(this.modelFor('document').document.get('id'), params.page_id),
			meta: this.get('documentService').getPageMeta(this.modelFor('document').document.get('id'), params.page_id)
		});
	}
});
