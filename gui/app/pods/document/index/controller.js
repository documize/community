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
import Controller from '@ember/controller';
import TooltipMixin from '../../../mixins/tooltip';

export default Controller.extend(TooltipMixin, {
	documentService: service('document'),
	templateService: service('template'),
	sectionService: service('section'),
	linkService: service('link'),
	queryParams: ['pageId', 'tab'],
	pageId: '',
	tab: 'content',

	actions: {
		onTabChange(tab) {
			this.set('tab', tab);
		},

		onSaveDocument(doc) {
			this.get('documentService').save(doc);

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
			let documentId = this.get('document.id');
			let model = {
				page: page.toJSON({ includeId: true }),
				meta: meta.toJSON({ includeId: true })
			};

			this.get('documentService').updatePage(documentId, page.get('id'), model).then((up) => {
				this.set('pageId', up.get('id'));

				this.get('documentService').getPages(this.get('document.id')).then((pages) => {
					this.set('pages', pages);

					this.get('linkService').getDocumentLinks(this.get('document.id')).then((links) => {
						this.set('links', links);
					});
				});
			});
		},

		onPageDeleted(deletePage) {
			let documentId = this.get('document.id');
			let pages = this.get('pages');
			let deleteId = deletePage.id;
			let deleteChildren = deletePage.children;
			let page = _.findWhere(pages, {
				id: deleteId
			});
			let pageIndex = _.indexOf(pages, page, false);
			let pendingChanges = [];

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
						this.set('pages', _.reject(pages, function (p) { //jshint ignore: line
							return p.get('id') === pageId;
						}));
					}

					this.set('pages', _.sortBy(pages, "sequence"));
					this.get('target._routerMicrolib').refresh();
				});
			} else {
				// page delete followed by re-leveling child pages
				this.get('documentService').deletePage(documentId, deleteId).then(() => {
					this.set('pages', _.reject(pages, function (p) {
						return p.get('id') === deleteId;
					}));

					this.send('onPageLevelChange', pendingChanges);
				});
			}
		},

		onInsertSection(data) {
			return new EmberPromise((resolve) => {
				this.get('documentService').addPage(this.get('document.id'), data).then((newPage) => {
					let data = this.get('store').normalize('page', newPage);
					this.get('store').push(data);
					this.set('pageId', newPage.id);

					this.get('documentService').getPages(this.get('document.id')).then((pages) => {
						this.set('pages', pages);

						if (newPage.pageType === 'tab') {
							this.transitionToRoute('document.section',
								this.get('folder.id'),
								this.get('folder.slug'),
								this.get('document.id'),
								this.get('document.slug'),
								newPage.id);
						} else {
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
			this.get('templateService').saveAsTemplate(this.get('document.id'), name, desc).then(function () {});
		},

		onPageSequenceChange(changes) {
			this.get('documentService').changePageSequence(this.get('document.id'), changes).then(() => {
				this.get('documentService').getPages(this.get('document.id')).then( (pages) => {
					this.set('pages', pages);				
				});
			});
		},

		onPageLevelChange(changes) {
			this.get('documentService').changePageLevel(this.get('document.id'), changes).then(() => {
				this.get('documentService').getPages(this.get('document.id')).then( (pages) => {
					this.set('pages', pages);				
				});
			});
		},

		onGotoPage(id) {
			if (id !== '') {
				this.set('pageId', id);
				this.set('tab', 'content');

				let jumpTo = "#page-" + id;
				if (!$(jumpTo).inView()) {
					$(jumpTo).velocity("scroll", { duration: 250, offset: -100 });
				}
			}
		},

		onTagChange(tags) {
			let doc = this.get('document');
			doc.set('tags', tags);
			this.get('documentService').save(doc);
		},

		onRollback(pageId, revisionId) {
			this.get('documentService').rollbackPage(this.get('document.id'), pageId, revisionId).then(() => {
				this.set('tab', 'content');
				this.get('target._routerMicrolib').refresh();
			});
		}		
	}
});
