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
	/* Parameters */
	document: null,
	// pages: [],
	attachments: [],
	folder: null,
	folders: [],
	isEditor: false,
	/* Internal */
	drop: null,
	deleteAttachment: {
		id: "",
		name: "",
	},

	noSections: Ember.computed('pages', function () {
		return this.get('pages.length') === 0;
	}),

	didInsertElement() {
		let self = this;

		// this.get('sectionService').refresh(this.get('document.id')).then(function (changes) {
		// 	changes.forEach(function (newPage) {
		// 		let oldPage = self.get('pages').findBy('id', newPage.get('id'));
		// 		if (is.not.undefined(oldPage)) {
		// 			oldPage.set('body', newPage.get('body'));
		// 			oldPage.set('revised', newPage.get('revised'));
		// 			self.showNotification(`Refreshed ${oldPage.get('title')}`);
		// 		}
		// 	});
		// });
	},

	didRender() {
		this.contentLinkHandler();
	},

	willDestroyElement() {
		this.destroyTooltips();

		let drop = this.get('drop');

		if (is.not.null(drop)) {
			drop.destroy();
		}
	},

	contentLinkHandler() {
		let links = this.get('link');
		let doc = this.get('document');
		let self = this;

		$("a[data-documize='true']").off('click').on('click', function(e) {
			let link = links.getLinkObject(self.get('meta.outboundLinks'), this);

			// local link? exists?
			if (link.linkType === "section" && link.documentId === doc.get('id')) {
				let exists = self.get('pages').findBy('id', link.targetId);

				if (_.isUndefined(exists)) {
					link.orphan = true;
				} else {
					self.attrs.gotoPage(link.targetId);
					return false;
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
		confirmDeleteAttachment(id, name) {
			this.set('deleteAttachment', {
				id: id,
				name: name
			});

			$(".delete-attachment-dialog").css("display", "block");

			let drop = new Drop({
				target: $(".delete-attachment-" + id)[0],
				content: $(".delete-attachment-dialog")[0],
				classes: 'drop-theme-basic',
				position: "bottom right",
				openOn: "always",
				tetherOptions: {
					offset: "5px 0",
					targetOffset: "10px 0"
				},
				remove: false
			});

			this.set('drop', drop);
		},

		cancel() {
			let drop = this.get('drop');
			drop.close();

			this.set('deleteAttachment', {
				id: "",
				name: ""
			});
		},

		deleteAttachment() {
			let attachment = this.get('deleteAttachment');
			let drop = this.get('drop');
			drop.close();

			this.showNotification(`Deleted ${attachment.name}`);
			this.attrs.onAttachmentDeleted(this.get('deleteAttachment').id);
			this.set('deleteAttachment', {
				id: "",
				name: ""
			});

			return true;
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

		// onTagChange event emitted from document/tag-editor component
		onTagChange(tags) {
			let doc = this.get('document');
			doc.set('tags', tags);
			this.get('documentService').save(doc);
		}
	}
});
