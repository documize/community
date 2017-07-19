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
import NotifierMixin from '../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),
	localStorage: Ember.inject.service('localStorage'),	
	hasSelectedDocuments: false,
	selectedDocuments: [],
	queryParams: ['tab'],
	tab: 'index',

	actions: {
		onDocumentsChecked(documents) {
			this.set('selectedDocuments', documents);
			this.set('hasSelectedDocuments', documents.length > 0);
		},

		onMoveDocument(folder) {
			let self = this;
			let documents = this.get('selectedDocuments');

			documents.forEach(function (documentId) {
				self.get('documentService').getDocument(documentId).then(function (doc) {
					doc.set('folderId', folder);
					doc.set('selected', !doc.get('selected'));
					self.get('documentService').save(doc).then(function () {
						self.get('target.router').refresh();
					});
				});
			});

			this.set('selectedDocuments', []);
			this.set('hasSelectedDocuments', false);
			this.send("showNotification", "Moved");
		},

		onDeleteDocument() {
			let documents = this.get('selectedDocuments');
			let self = this;

			documents.forEach(function (document) {
				self.get('documentService').deleteDocument(document).then(function () {
					self.get('target.router').refresh();
				});
			});

			this.set('selectedDocuments', []);
			this.set('hasSelectedDocuments', false);
			this.send("showNotification", "Deleted");
		},

		onFolderAdd(folder) {
			let self = this;
			this.showNotification("Added");

			this.get('folderService').add({ name: folder }).then(function (newFolder) {
				self.get('folderService').setCurrentFolder(newFolder);
				self.transitionToRoute('folder', newFolder.get('id'), newFolder.get('slug'));
			});
		},

		onDeleteSpace() {
			this.get('folderService').delete(this.get('model.folder.id')).then(() => { /* jshint ignore:line */
				this.showNotification("Deleted");
				this.get('localStorage').clearSessionItem('folder');
				this.transitionToRoute('application');
			});
		},

		onImport() {
			this.get('target.router').refresh();
		}
	}
});
