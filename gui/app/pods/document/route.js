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
	linkService: Ember.inject.service('link'),

	beforeModel(transition) {
		this.set('pageId', is.not.undefined(transition.queryParams.page) ? transition.queryParams.page : "");
		this.set('folderId', this.paramsFor('document').folder_id);
		this.set('documentId', this.paramsFor('document').document_id);

		return new Ember.RSVP.Promise((resolve) => {
			this.get('documentService').fetchDocumentData(this.get('documentId')).then((data) => {
				this.set('document', data.document);
				this.set('folders', data.folders);
				this.set('folder', data.folder);
				this.set('permissions', data.permissions);
				this.set('links', data.links);
				resolve();
			});
		});
	},

	model() {
		return Ember.RSVP.hash({
			folders: this.get('folders'),
			folder: this.get('folder'),
			document: this.get('document'),
			page: this.get('pageId'),
			permissions: this.get('permissions'),
			links: this.get('links'),
			sections: this.get('sectionService').getAll()
		});
	},

	actions: {
		error(error /*, transition*/ ) {
			if (error) {
				this.transitionTo('/not-found');
				return false;
			}
		}
	}
});
