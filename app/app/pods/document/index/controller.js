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
	sectionService: Ember.inject.service('section'),
	queryParams: ['page'],

	// Jump to the right part of the document.
	scrollToPage(pageId) {
		Ember.run.schedule('afterRender', function () {
			let dest;
			let target = "#page-title-" + pageId;
			let targetOffset = $(target).offset();

			if (is.undefined(targetOffset)) {
				return;
			}

			dest = targetOffset.top > $(document).height() - $(window).height() ? $(document).height() - $(window).height() : targetOffset.top;
			// small correction to ensure we also show page title
			dest = dest > 50 ? dest - 74 : dest;

			$("html,body").animate({
				scrollTop: dest
			}, 500, "linear");
			$(".toc-index-item").removeClass("selected");
			$("#index-" + pageId).addClass("selected");
		});
	},

	actions: {
		gotoPage(pageId) {
			if (is.null(pageId)) {
				return;
			}

			this.scrollToPage(pageId);
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
				this.set('model.pages', pages);

				this.get('target.router').refresh();
			});
		},

		onAddBlock(block) {
			this.get('sectionService').addBlock(block).then(() => {
				this.showNotification("Published");
			});
		},

		onCopyPage(pageId, targetDocumentId) {
			let documentId = this.get('model.document.id');
			this.get('documentService').copyPage(documentId, pageId, targetDocumentId).then(() => {
				this.showNotification("Copied");
	
				// refresh data if copied to same document
				if (documentId === targetDocumentId) {
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
					this.get('target.router').refresh();
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
		}
	}
});
