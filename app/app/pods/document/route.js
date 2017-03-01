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

							this.get('documentService').getPages(this.get('documentId')).then((pages) => {
								this.set('allPages', pages);
								this.set('pages', pages.filterBy('pageType', 'section'));
								this.set('tabs', pages.filterBy('pageType', 'tab'));
								resolve();
							});
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
			allPages: this.get('allPages'),
			pages: this.get('pages'),
			tabs: this.get('tabs'),
			sections: this.get('sectionService').getAll().then((sections) => {
				return sections;
				// return sections.filterBy('pageType', 'section');
				// return sections.filterBy('pageType', 'tab');
			}),
		});
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
