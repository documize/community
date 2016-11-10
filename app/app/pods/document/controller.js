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
	templateService: Ember.inject.service('template'),

	page: null,
	folder: {},
	pages: [],

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
			let self = this;

			this.get('documentService').changePageSequence(this.model.get('id'), changes).then(function () {
				_.each(changes, function (change) {
					let pageContent = _.findWhere(self.get('pages'), {
						id: change.pageId
					});

					if (is.not.undefined(pageContent)) {
						pageContent.set('sequence', change.sequence);
					}
				});

				self.set('pages', self.get('pages').sortBy('sequence'));
			});
		},

		onPageLevelChange(changes) {
			let self = this;

			this.get('documentService').changePageLevel(this.model.get('id'), changes).then(function () {
				_.each(changes, function (change) {
					let pageContent = _.findWhere(self.get('pages'), {
						id: change.pageId
					});

					if (is.not.undefined(pageContent)) {
						pageContent.set('level', change.level);
					}
				});

				let pages = self.get('pages');
				pages = pages.sortBy('sequence');
				self.set('pages', []);
				self.set('pages', pages);
			});
		},

		onPageDeleted(deletePage) {
			let self = this;
			let documentId = this.get('model.id');
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

			if (deleteChildren) {
				// nuke of page tree
				pendingChanges.push({
					pageId: deleteId
				});

				this.get('documentService').deletePages(documentId, deleteId, pendingChanges).then(function () {
					// update our models so we don't have to reload from db
					for (var i = 0; i < pendingChanges.length; i++) {
						let pageId = pendingChanges[i].pageId;
						self.set('pages', _.reject(self.get('pages'), function (p) { //jshint ignore: line
							return p.id === pageId;
						}));
					}

					self.set('pages', _.sortBy(self.get('pages'), "sequence"));

					self.audit.record("deleted-page");

					// fetch document meta
					self.get('documentService').getMeta(self.model.get('id')).then(function (meta) {
						self.set('meta', meta);
					});
				});
			} else {
				// page delete followed by re-leveling child pages
				this.get('documentService').deletePage(documentId, deleteId).then(function () {
					self.set('pages', _.reject(self.get('pages'), function (p) {
						return p.get('id') === deleteId;
					}));

					self.audit.record("deleted-page");

					// fetch document meta
					self.get('documentService').getMeta(self.model.get('id')).then(function (meta) {
						self.set('meta', meta);
					});
				});

				self.send('onPageLevelChange', pendingChanges);
			}
		},

		onSaveTemplate(name, desc) {
			this.get('templateService').saveAsTemplate(this.model.get('id'), name, desc).then(function () {});
		},

		onAddSection(section) {
			this.audit.record("added-section-" + section.get('contentType'));

			let page = {
				documentId: this.get('model.id'),
				title: `${section.get('title')}`,
				level: 1,
				sequence: 0,
				body: "",
				contentType: section.get('contentType'),
				pageType: section.get('pageType')
			};

			let data = this.get('store').normalize('page', page);
			let pageData = this.get('store').push(data);

			let meta = {
				documentId: this.get('model.id'),
				rawBody: "",
				config: ""
			};

			let pageMeta = this.get('store').normalize('page-meta', meta);
			let pageMetaData = this.get('store').push(pageMeta);

			let model = {
				page: pageData,
				meta: pageMetaData
			};

			this.get('documentService').addPage(this.get('model.id'), model).then((newPage) => {
				let data = this.get('store').normalize('page', newPage);
				this.get('store').push(data);
				console.log(newPage);

				this.transitionToRoute('document.edit',
					this.get('folder.id'),
					this.get('folder.slug'),
					this.get('model.id'),
					this.get('model.slug'),
					newPage.id);
			});
		},

		onDocumentDelete() {
			let self = this;

			this.get('documentService').deleteDocument(this.get('model.id')).then(function () {
				self.audit.record("deleted-page");
				self.send("showNotification", "Deleted");
				self.transitionToRoute('folder', self.get('folder.id'), self.get('folder.slug'));
			});
		}
	}
});
