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
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
	documentService: Ember.inject.service('document'),
	sectionService: Ember.inject.service('section'),
	appMeta: Ember.inject.service(),
	link: Ember.inject.service(),
	document: null,
	folder: null,
	folders: [],
	isEditor: false,

	noSections: Ember.computed('pages', function () {
		return this.get('pages.length') === 0;
	}),

	didRender() {
		this.contentLinkHandler();
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	contentLinkHandler() {
		let links = this.get('link');
		let doc = this.get('document');
		let self = this;

		$("a[data-documize='true']").off('click').on('click', function (e) {
			let link = links.getLinkObject(self.get('links'), this);

			// local link? exists?
			if ((link.linkType === "section" || link.linkType === "tab") && link.documentId === doc.get('id')) {
				let exists = self.get('allPages').findBy('id', link.targetId);

				if (_.isUndefined(exists)) {
					link.orphan = true;
				} else {
					if (link.linkType === "section") {
						self.attrs.gotoPage(link.targetId);
					}
				}
			}

			if (link.orphan) {
				$(this).addClass('broken-link');
				self.showNotification('Broken link!');
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			links.linkClick(doc, link);
			return false;
		});
	},

	actions: {
		onAddBlock(block) {
			this.attrs.onAddBlock(block);
		},

		onCopyPage(pageId, documentId) {
			this.attrs.onCopyPage(pageId, documentId);
		},

		onMovePage(pageId, documentId) {
			this.attrs.onMovePage(pageId, documentId);
		},

		onDeletePage(id, deleteChildren) {
			let page = this.get('pages').findBy("id", id);

			if (is.undefined(page)) {
				return;
			}

			let params = {
				id: id,
				title: page.get('title'),
				children: deleteChildren
			};

			this.attrs.onDeletePage(params);
		},

		onTagChange(tags) {
			let doc = this.get('document');
			doc.set('tags', tags);
			this.get('documentService').save(doc);
		}
	}
});
