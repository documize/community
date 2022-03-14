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

import { Promise as EmberPromise, all } from 'rsvp';
import { inject as service } from '@ember/service';
import Notifier from '../../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(Notifier, {
	documentService: service('document'),
	templateService: service('template'),
	sectionService: service('section'),
	linkService: service('link'),
	localStore: service('local-storage'),
	appMeta: service(),
	router: service(),
	i18n: service(),
	sidebarTab: 'toc',
	queryParams: ['currentPageId', 'source'],
	contributionStatus: '',
	approvalStatus: '',

	actions: {
		onSidebarChange(tab) {
			this.set('sidebarTab', tab);
		},

		onShowPage(pageId) {
			this.get('browser').scrollTo(`#page-${pageId}`);
		},

		onSaveDocument(doc) {
			this.get('documentService').save(doc).then(() => {
				this.notifySuccess(this.i18n.localize('saved'));
			});
			this.get('browser').setTitle(doc.get('name'));
			this.get('browser').setMetaDescription(doc.get('excerpt'));
		},

		onCopyPage(pageId, targetDocumentId) {
			let documentId = this.get('document.id');
			let pages = this.get('pages');

			// Make list of page ID values including all child pages.
			let pagesToProcess = [{ pageId: pageId }].concat(this.get('documentService').getChildren(pages, pageId));

			// Copy each page.
			let promises = [];
			pagesToProcess.forEach((page, index) => {
				promises[index] = this.get('documentService').copyPage(documentId, page.pageId, targetDocumentId);
			});

			// Do post-processing after all copying has completed.
			all(promises).then(() => {
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
			let pages = this.get('pages');

			// Make list of page ID values including all child pages.
			let pagesToProcess = [{ pageId: pageId }].concat(this.get('documentService').getChildren(pages, pageId));

			// Copy each page.
			let promises = [];
			pagesToProcess.forEach((page, index) => {
				promises[index] = this.get('documentService').copyPage(documentId, page.pageId, targetDocumentId);
			});

			// Do post-processing after all copying has completed.
			all(promises).then(() => {
				// For move operation we delete all copied pages.
				this.send('onPageDeleted', { id: pageId, children: true });
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
				this.notifySuccess(this.i18n.localize('saved'));

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

			let pages = this.get('pages');
			let pendingChanges = this.get('documentService').getChildren(pages, deleteId);

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
					this.notifySuccess(this.i18n.localize('saved'));

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
			this.get('templateService').saveAsTemplate(this.get('document.id'), name, desc).then(() => {
				this.notifySuccess(this.i18n.localize('saved'));
			});
		},

		onDuplicate(name) {
			this.get('documentService').duplicate(this.get('folder.id'), this.get('document.id'), name).then(() => {
				this.notifySuccess(this.i18n.localize('duplicated'));
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
				this.get('documentService').fetchPages(this.get('document.id'), this.get('session.user.id')).then((pages) => {
					this.set('pages', pages);
				});
			});
		},

		onTagChange(tags) {
			let doc = this.get('document');
			doc.set('tags', tags);
			this.get('documentService').save(doc).then(()=> {
				this.notifySuccess(this.i18n.localize('saved'));
			});
		},

		onEditMeta() {
			if (!this.get('permissions.documentEdit')) return;

			this.get('router').transitionTo('document.settings', {queryParams: {tab: 'general'}});
		},

		onAttachmentUpload() {
			this.get('documentService').getAttachments(this.get('document.id')).then((files) => {
				this.set('attachments', files);
			});
		},

		onAttachmentDelete(attachmentId) {
			this.get('documentService').deleteAttachment(this.get('document.id'), attachmentId).then(() => {
				this.get('documentService').getAttachments(this.get('document.id')).then((files) => {
					this.set('attachments', files);
				});
			});
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
					this.set('attachments', data.attachments);

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
		},

		// Expand all if nothing is expanded at the moment.
		// Collapse all if something is expanded at the moment.
		onExpandAll() {
			let expandState = this.get('localStore').getDocSectionHide(this.get('document.id'));

			if (expandState.length === 0) {
				let pages = this.get('pages');
				pages.forEach((item) => {
					expandState.push(item.get('page.id'));
				})
			} else {
				expandState = [];
			}

			this.get('localStore').setDocSectionHide(this.get('document.id'), expandState);
			this.set('expandState', expandState);
		},

		onExpand(pageId, show) {
			let expandState = this.get('localStore').getDocSectionHide(this.get('document.id'));

			if (show) {
				expandState = _.without(expandState, pageId)
			} else {
				expandState.push(pageId);
			}

			this.get('localStore').setDocSectionHide(this.get('document.id'), expandState);
		}
	}
});
