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

import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import NotifierMixin from '../../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(NotifierMixin, {
	documentService: service('document'),
	folderService: service('folder'),
	localStorage: service('localStorage'),
	browserSvc: service('browser'),
	documentSvc: service('document'),
	queryParams: ['category'],
	category: '',
	filteredDocs: null,

	actions: {
		onRefresh() {
			this.get('target._routerMicrolib').refresh();
		},

		onMoveDocument(documents, targetSpaceId) {
			let self = this;
			let promises1 = [];
			let promises2 = [];

			documents.forEach(function(documentId, index) {
				promises1[index] = self.get('documentService').getDocument(documentId);
			});

			all(promises1).then(() => {
				promises1.forEach(function(doc, index) {
					doc.then((d) => {
						d.set('spaceId', targetSpaceId);
						d.set('selected', false);
						promises2[index] = self.get('documentService').save(d);
					});
				});

				all(promises2).then(() => {
					self.send('onRefresh');
				});
			});
		},

		onDeleteDocument(documents) {
			let self = this;
			let promises = [];

			documents.forEach(function (document, index) {
				promises[index] = self.get('documentService').deleteDocument(document);
			});

			all(promises).then(() => {
				this.send('onRefresh');
			});
		},

		onExportDocument(documents) {
			this.showWait();

			let spec = {
				spaceId: this.get('model.folder.id'),
				data: documents,
				filterType: 'document',
			};

			this.get('documentSvc').export(spec).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, this.get('model.folder.slug') + '.html');
				this.showDone();
			});
		},

		onFiltered(docs) {
			this.set('filteredDocs', docs);
		}
	}
});
