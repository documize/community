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
			this.get('documentService').getDocument(this.get('documentId')).then((document) => {
				this.set('document', document);

				this.get('folderService').getAll().then((folders) => {
					this.set('folders', folders);

					this.get('folderService').getFolder(this.get('folderId')).then((folder) => {
						this.set('folder', folder);

						this.get('folderService').setCurrentFolder(folder).then(() => {
							this.set('isEditor', this.get('folderService').get('canEditCurrentFolder'));
							resolve();
						});
					});
				});
			});
		});
	},

	model() {
		return Ember.RSVP.hash({
			folders: this.get('folders'),
			folder: this.get('folder'),
			document: this.get('document'),
			page: this.get('pageId'),
			isEditor: this.get('isEditor'),
			links: this.get('linkService').getDocumentLinks(this.get('documentId')),
			sections: this.get('sectionService').getAll()
		});
	},
	
	activate() {
		$('body').addClass('background-color-off-white');
	},

	deactivate() {
		$('body').removeClass('background-color-off-white');
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
