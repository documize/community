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

import { Promise as EmberPromise } from 'rsvp';
import { inject as service } from '@ember/service';
import Tooltips from '../../../mixins/tooltip';
import Notifier from '../../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(Tooltips, Notifier, {
	documentService: service('document'),
	templateService: service('template'),
	sectionService: service('section'),
	linkService: service('link'),
	// currentPageId: '',
	tab: 'content',
	tabCount: 0, // how many items inside the tab?
	queryParams: ['currentPageId'],

	actions: {
		onTabChange(tab) {
			this.set('tab', tab);
			if (tab === 'content') {
				this.send('refresh');
			}
		},

		onShowPage(pageId) {
			this.set('tab', 'content');
			this.get('browser').scrollTo(`#page-${pageId}`);
		},

		onSaveDocument(doc) {
			this.showWait();
			this.get('documentService').save(doc).then(() => {
				this.showDone();
			});
			this.get('browser').setTitle(doc.get('name'));
			this.get('browser').setMetaDescription(doc.get('excerpt'));
		},

		onCopyPage(pageId, targetDocumentId) {
			let documentId = this.get('document.id');
			this.get('documentService').copyPage(documentId, pageId, targetDocumentId).then(() => {

				// refresh data if copied to same document
				if (documentId === targetDocumentId) {
					this.set('pageId', '');
					this.get('target._routerMicrolib').refresh();

					this.get('linkService').getDocumentLinks(this.get('document.id')).then((links) => {
						this.set('links', links);
					});
				}
			});
		},

		onMovePage(pageId, targetDocumentId) {
			let documentId = this.get('document.id');

			this.get('documentService').copyPage(documentId, pageId, targetDocumentId).then(() => {
				this.send('onPageDeleted', { id: pageId, children: false });
			});
		},

		onSavePage(page, meta) {
			this.showWait();

			let document = this.get('document');
			let documentId = document.get('id');
			let constants = this.get('constants');

			// if document approval mode is locked return
			if (document.get('protection') == constants.ProtectionType.Lock) {
				// should not really happen
				return;
			}

			// Go ahead and save edits as normal
			let model = {
				page: page.toJSON({ includeId: true }),
				meta: meta.toJSON({ includeId: true })
			};

			this.get('documentService').updatePage(documentId, page.get('id'), model).then((/*up*/) => {
				this.showDone();

				this.get('documentService').fetchPages(documentId, this.get('session.user.id')).then((pages) => {
					this.set('pages', pages);
					this.get('linkService').getDocumentLinks(documentId).then((links) => {
						this.set('links', links);
					});
				});
			});
		},

		onPageDeleted(deletePage) {
			let documentId = this.get('document.id');
			let deleteId = deletePage.id;
			let deleteChildren = deletePage.children;
			let pendingChanges = [];

			let pages = this.get('pages');
			let pageIndex = _.findIndex(pages, function(i) { return i.get('page.id') === deleteId; });
			let item = pages[pageIndex];

			// select affected pages
			for (var i = pageIndex + 1; i < pages.get('length'); i++) {
				if (i === pageIndex + 1 && pages[i].get('page.level') === item.get('page.level')) break;
				if (pages[i].get('page.level') <= item.get('page.level')) break;

				pendingChanges.push({ pageId: pages[i].get('page.id'), level: pages[i].get('page.level') - 1 });
			}

			this.set('currentPageId', null);

			if (deleteChildren) {
				pendingChanges.push({ pageId: deleteId });

				this.get('documentService').deletePages(documentId, deleteId, pendingChanges).then(() => {
					this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then((pages) => {
						this.set('pages', pages);
					});
				});
			} else {
				this.get('documentService').deletePage(documentId, deleteId).then(() => {
					this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then((pages) => {
						this.set('pages', pages);
					});
				});
			}
		},

		onInsertSection(data) {
			this.showWait();

			return new EmberPromise((resolve) => {
				this.get('documentService').addPage(this.get('document.id'), data).then((newPage) => {
					let data = this.get('store').normalize('page', newPage);
					this.get('store').push(data);
					this.showDone();

					this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then((pages) => {
						this.set('pages', pages);
						this.eventBus.publish('documentPageAdded', newPage.id);

						if (newPage.pageType === 'tab') {
							this.transitionToRoute('document.section',
								this.get('folder.id'),
								this.get('folder.slug'),
								this.get('document.id'),
								this.get('document.slug'),
								newPage.id);
						} else {
							this.set('currentPageId', newPage.id);
							resolve(newPage.id);
						}
					});
				});
			});
		},

		onDeleteBlock(blockId) {
			return new EmberPromise((resolve) => {
				this.get('sectionService').deleteBlock(blockId).then(() => {
					resolve();
				});
			});
		},

		onSavePageAsBlock(block) {
			return new EmberPromise((resolve) => {
				this.get('sectionService').addBlock(block).then(() => {
					resolve();
				});
			});
		},

		onDocumentDelete() {
			this.get('documentService').deleteDocument(this.get('document.id')).then(() => {
				this.transitionToRoute('folder', this.get('folder.id'), this.get('folder.slug'));
			});
		},

		onSaveTemplate(name, desc) {
			this.showWait();

			this.get('templateService').saveAsTemplate(this.get('document.id'), name, desc).then(function () {
				this.showDone();
			});
		},

		onPageSequenceChange(currentPageId, changes) {
			this.set('currentPageId', currentPageId);
			this.get('documentService').changePageSequence(this.get('document.id'), changes).then(() => {
				this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then( (pages) => {
					this.set('pages', pages);
				});
			});
		},

		onPageLevelChange(currentPageId, changes) {
			this.set('currentPageId', currentPageId);
			this.get('documentService').changePageLevel(this.get('document.id'), changes).then(() => {
				this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then( (pages) => {
					this.set('pages', pages);
				});
			});
		},

		onTagChange(tags) {
			this.showDone();

			let doc = this.get('document');
			doc.set('tags', tags);
			this.get('documentService').save(doc).then(()=> {
				this.showWait();
			});
		},

		onRollback(pageId, revisionId) {
			this.get('documentService').rollbackPage(this.get('document.id'), pageId, revisionId).then(() => {
				this.set('tab', 'content');
				this.get('target._routerMicrolib').refresh();
			});
		},

		refresh() {
			return new EmberPromise((resolve) => {
			this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then((data) => {
				this.set('pages', data);

			this.get('sectionService').getSpaceBlocks(this.get('folder.id')).then((data) => {
				this.set('blocks', data);
			});

					resolve();
				});
			});
		},

		onReady(count) {
			this.set('tabCount', count);
		}
	}
});
