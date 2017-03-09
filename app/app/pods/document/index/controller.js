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
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	documentService: Ember.inject.service('document'),
	templateService: Ember.inject.service('template'),
	sectionService: Ember.inject.service('section'),
	folder: {},
	pages: [],
	toggled: false,
	queryParams: ['pageId', 'tab'],
  	pageId: '',
  	tab: 'index',

	actions: {
		toggleSidebar() {
			this.set('toggled', !this.get('toggled'));
		},

		onSaveDocument(doc) {
			this.get('documentService').save(doc);
			this.showNotification('Saved');
		},

		onCopyPage(pageId, targetDocumentId) {
			let documentId = this.get('model.document.id');
			this.get('documentService').copyPage(documentId, pageId, targetDocumentId).then(() => {
				this.showNotification("Copied");

				// refresh data if copied to same document
				if (documentId === targetDocumentId) {
					this.set('pageId', '');
					this.get('target.router').refresh();
				}
			});
		},

		onMovePage(pageId, targetDocumentId) {
			let documentId = this.get('model.document.id');

			this.get('documentService').copyPage(documentId, pageId, targetDocumentId).then(() => {
				this.showNotification("Moved");
				this.send('onPageDeleted', { id: pageId, children: false });
			});
		},

		onSavePage(page, meta) {
			let documentId = this.get('model.document.id');
			let model = {
				page: page.toJSON({ includeId: true }),
				meta: meta.toJSON({ includeId: true })
			};

			this.get('documentService').updatePage(documentId, page.get('id'), model).then(() => {
				this.set('pageId', page.get('id'));
			});

			this.audit.record("edited-page");
		},

		onPageDeleted(deletePage) {
			let documentId = this.get('model.document.id');
			let pages = this.get('model.pages');
			let deleteId = deletePage.id;
			let deleteChildren = deletePage.children;
			let page = _.findWhere(pages, {
				id: deleteId
			});
			let pageIndex = _.indexOf(pages, page, false);
			let pendingChanges = [];

			this.audit.record("deleted-page");

			// select affected pages
			for (var i = pageIndex + 1; i < pages.get('length'); i++) {
				if (pages[i].get('level') <= page.get('level')) {
					break;
				}

				pendingChanges.push({
					pageId: pages[i].get('id'),
					level: pages[i].get('level') - 1
				});
			}

			this.set('pageId', '');

			if (deleteChildren) {
				// nuke of page tree
				pendingChanges.push({
					pageId: deleteId
				});

				this.get('documentService').deletePages(documentId, deleteId, pendingChanges).then(() => {
					// update our models so we don't have to reload from db
					for (var i = 0; i < pendingChanges.length; i++) {
						let pageId = pendingChanges[i].pageId;
						this.set('model.pages', _.reject(pages, function (p) { //jshint ignore: line
							return p.get('id') === pageId;
						}));
					}

					this.set('model.pages', _.sortBy(pages, "sequence"));
					this.transitionToRoute('document.index',
						this.get('model.folder.id'),
						this.get('model.folder.slug'),
						this.get('model.document.id'),
						this.get('model.document.slug'));
				});
			} else {
				// page delete followed by re-leveling child pages
				this.get('documentService').deletePage(documentId, deleteId).then(() => {
					this.set('model.pages', _.reject(pages, function (p) {
						return p.get('id') === deleteId;
					}));

					this.send('onPageLevelChange', pendingChanges);
				});
			}
		},

		onInsertSection(data) {
			return new Ember.RSVP.Promise((resolve) => {
				this.get('documentService').addPage(this.get('model.document.id'), data).then((newPage) => {
					let data = this.get('store').normalize('page', newPage);
					this.get('store').push(data);
					this.set('pageId', newPage.id);

					this.get('documentService').getPages(this.get('model.document.id')).then((pages) => {
						this.set('model.pages', pages);

						if (newPage.pageType === 'tab') {
							this.transitionToRoute('document.section',
								this.get('model.folder.id'),
								this.get('model.folder.slug'),
								this.get('model.document.id'),
								this.get('model.document.slug'),
								newPage.id);
						} else {
							resolve(newPage.id);
						}
					});
				});
			});
		},

		onDeleteBlock(blockId) {
			return new Ember.RSVP.Promise((resolve) => {
				this.get('sectionService').deleteBlock(blockId).then(() => {
					this.audit.record("deleted-block");
					this.send("showNotification", "Deleted");
					resolve();
				});
			});
		},

		onSavePageAsBlock(block) {
			return new Ember.RSVP.Promise((resolve) => {
				this.get('sectionService').addBlock(block).then(() => {
					this.showNotification("Published");
					resolve();
				});
			});
		},

		onDocumentDelete() {
			this.get('documentService').deleteDocument(this.get('model.document.id')).then(() => {
				this.audit.record("deleted-page");
				this.send("showNotification", "Deleted");
				this.transitionToRoute('folder', this.get('model.folder.id'), this.get('model.folder.slug'));
			});
		},

		onSaveTemplate(name, desc) {
			this.get('templateService').saveAsTemplate(this.get('model.document.id'), name, desc).then(function () {});
		},

		onPageSequenceChange(changes) {
			this.get('documentService').changePageSequence(this.get('model.document.id'), changes).then(() => {
				_.each(changes, (change) => {
					let pageContent = _.findWhere(this.get('model.pages'), {
						id: change.pageId
					});

					if (is.not.undefined(pageContent)) {
						pageContent.set('sequence', change.sequence);
					}
				});

				this.set('model.pages', this.get('model.pages').sortBy('sequence'));
				this.get('target.router').refresh();
			});
		},

		onPageLevelChange(changes) {
			this.get('documentService').changePageLevel(this.get('model.document.id'), changes).then(() => {
				_.each(changes, (change) => {
					let pageContent = _.findWhere(this.get('model.pages'), {
						id: change.pageId
					});

					if (is.not.undefined(pageContent)) {
						pageContent.set('level', change.level);
					}
				});

				let pages = this.get('model.pages');
				pages = pages.sortBy('sequence');
				this.set('model.pages', []);
				this.set('model.pages', pages);
				this.get('target.router').refresh();
			});
		},

		onGotoPage(id) {
			if (this.get('pageId') !== id && id !== '') {
				this.set('pageId', id);
			}
		}
	}
});
