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
import { computed } from '@ember/object';
import Notifier from '../../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(Notifier, {
	documentService: service('document'),
	templateService: service('template'),
	sectionService: service('section'),
	linkService: service('link'),
	router: service(),
	sidebarTab: 'toc',
	tab: 'content',
	queryParams: ['currentPageId', 'source'],
	showRevisions: computed('permissions', 'document.protection', function() {
		if (!this.get('session.viewUsers')) return false;
		if (this.get('document.protection') === this.get('constants').ProtectionType.None) return true;
		if (this.get('document.protection') === this.get('constants').ProtectionType.Review && this.get('permissions.documentApprove')) return true;

		return false;
	}),

	actions: {
		onSidebarChange(tab) {
			this.set('sidebarTab', tab);
		},

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
			this.get('documentService').save(doc).then(() => {
				this.notifySuccess('Saved');
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
			let document = this.get('document');
			let documentId = document.get('id');
			let constants = this.get('constants');

			// Cannot change locked documents.
			if (document.get('protection') === constants.ProtectionType.Lock) {
				return;
			}

			// Detect stale data situation and reload page.
			// Happens when you are saving section edits that
			// has just been approved.
			// TODO: really need a better way than this
			if (page.get('id') === page.get('relativeId')) {
				window.location.reload();
				return;
			}

			// Go ahead and save edits as normal
			let model = {
				page: page.toJSON({ includeId: true }),
				meta: meta.toJSON({ includeId: true })
			};

			this.get('documentService').updatePage(documentId, page.get('id'), model).then((/*up*/) => {
				this.notifySuccess('Saved');

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
			return new EmberPromise((resolve) => {
				this.get('documentService').addPage(this.get('document.id'), data).then((newPage) => {
					let data = this.get('store').normalize('page', newPage);
					this.get('store').push(data);
					this.notifySuccess('Inserted');

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
			this.get('templateService').saveAsTemplate(this.get('document.id'), name, desc).then(function () {
				this.notifySuccess('Template saved');
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
			let doc = this.get('document');
			doc.set('tags', tags);
			this.get('documentService').save(doc).then(()=> {
				this.notifySuccess('Saved');
			});
		},

		onRollback(pageId, revisionId) {
			this.get('documentService').rollbackPage(this.get('document.id'), pageId, revisionId).then(() => {
				this.set('tab', 'content');
				this.get('target._routerMicrolib').refresh();
			});
		},

		onEditMeta() {
			if (!this.get('permissions.documentEdit')) return;

			this.get('router').transitionTo('document.settings', {queryParams: {tab: 'general'}});
		},

		refresh(reloadPage) {
			return new EmberPromise((resolve) => {
				this.get('documentService').fetchDocumentData(this.get('document.id')).then((data) => {
					this.set('document', data.document);
					this.set('folders', data.folders);
					this.set('folder', data.folder);
					this.set('permissions', data.permissions);
					this.set('roles', data.roles);
					this.set('links', data.links);
					this.set('versions', data.versions);

					this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then((data) => {
						this.set('pages', data);

						this.get('sectionService').getSpaceBlocks(this.get('folder.id')).then((data) => {
							this.set('blocks', data);
						});

						if (reloadPage) {
							window.location.reload();
						} else {
						resolve();
						}
					});
				});
			});
		}
	}
});
