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
	router: service(),
	documentService: service('document'),
	folderService: service('folder'),
	localStorage: service('localStorage'),
	browserSvc: service('browser'),
	documentSvc: service('document'),
	i18n: service(),

	queryParams: ['category'],
	category: '',
	filteredDocs: null,
	// eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
	sortBy: {
		name: true,
		created: false,
		updated: false,
		asc: true,
		desc: false,
	},

	actions: {
		onBack() {
			this.get('router').transitionTo('folders');
		},

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
			let spec = {
				spaceId: this.get('model.folder.id'),
				data: documents,
				filterType: 'document',
			};

			this.get('documentSvc').export(spec).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, this.get('model.folder.slug') + '.html');
				this.notifySuccess(this.i18n.localize('exported'));
			});
		},

		onFiltered(docs) {
			let ls = this.get('localStorage');
			let sortBy = this.get('sortBy');
			let constants = this.get('constants');

			if (_.isNull(docs)) return;

			let pinned = _.filter(docs, function(d) { return d.get('sequence') !== constants.Unsequenced; })
			let unpinned = _.filter(docs, function(d) { return d.get('sequence') === constants.Unsequenced; })

			if (sortBy.name) {
				unpinned = unpinned.sortBy('name');
				ls.storeSessionItem('space.sortBy', 'name');
			}
			if (sortBy.created) {
				unpinned = unpinned.sortBy('created');
				ls.storeSessionItem('space.sortBy', 'created');
			}
			if (sortBy.updated) {
				unpinned = unpinned.sortBy('revised');
				ls.storeSessionItem('space.sortBy', 'updated');
			}
			if (sortBy.desc) {
				unpinned = unpinned.reverseObjects();
				ls.storeSessionItem('space.sortOrder', 'desc');
			} else {
				ls.storeSessionItem('space.sortOrder', 'asc');
			}

			this.set('filteredDocs', _.concat(pinned, unpinned));
		},

		onPin(documentId) {
            this.get('documentSvc').pin(documentId).then(() => {
                this.notifySuccess(this.i18n.localize('pinned'));
                this.send('onRefresh');
            });
		},

		onUnpin(documentId) {
            this.get('documentSvc').unpin(documentId).then(() => {
                this.notifySuccess(this.i18n.localize('unpinned'));
                this.send('onRefresh');
            });
		},

        onPinSequence(documentId, direction) {
            this.get('documentSvc').onPinSequence(documentId, direction).then(() => {
                this.notifySuccess(this.i18n.localize('moved'));
                this.send('onRefresh');
            });
        },
	}
});
