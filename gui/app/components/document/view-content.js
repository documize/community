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

import $ from 'jquery';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	documentService: service('document'),
	sectionService: service('section'),
	store: service(),
	appMeta: service(),
	linkSvc: service('link'),
	hasPages: notEmpty('pages'),
	showInsertSectionModal: false,
	newSectionLocation: '',
	toEdit: '',
	canEdit: computed('permissions', 'document.protection', function() {
		let canEdit = this.get('document.protection') !== this.get('constants').ProtectionType.Lock && this.get('permissions.documentEdit');
		return canEdit;
	}),
	voteThanks: false,
	showLikes: false,
	showDeleteBlockDialog: false,
	deleteBlockId: '',

	didReceiveAttrs() {
		this._super(...arguments);

		// Show/allow liking if space allows it and document is published.
		this.set('showLikes', this.get('folder.allowLikes') && this.get('document.isLive'));
	},

	didInsertElement() {
		this._super(...arguments);
		this.jumpToSection(this.get('currentPageId'));
	},

	didRender() {
		this._super(...arguments);

		this.contentLinkHandler();
	},

	contentLinkHandler() {
		let linkSvc = this.get('linkSvc');
		let doc = this.get('document');
		let self = this;

		$("a[data-documize='true']").off('click').on('click', function (e) {
			let link = linkSvc.getLinkObject(self.get('links'), this);

			// local link? exists?
			if ((link.linkType === "section" || link.linkType === "tab") && link.documentId === doc.get('id')) {
				let exists = self.get('pages').findBy('id', link.targetId);

				if (_.isUndefined(exists)) {
					link.orphan = true;
				} else {
					if (link.linkType === "section") {
						self.jumpToSection(link.targetId);
					}
				}
			}

			if (link.orphan) {
				$(this).addClass('broken-link');
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			e.preventDefault();
			e.stopPropagation();

			linkSvc.linkClick(doc, link);
			return false;
		});
	},

	jumpToSection(cp) {
		if (!_.isEmpty(cp) && !_.isUndefined(cp) && !_.isNull(cp)) {
			this.get('browser').waitScrollTo(`#page-${cp}`);
		}
	},

	addSection(model) {
		let constants = this.get('constants');

		if (this.get('document.protection') === constants.ProtectionType.Review) {
			model.page.set('status', model.page.get('relativeId') === '' ? constants.ChangeState.PendingNew : constants.ChangeState.Pending);
		}

		return this.get('onInsertSection')(model);
	},

	actions: {
		onSavePageAsBlock(block) {
			let cb = this.get('onSavePageAsBlock');
			const promise = cb(block);

			promise.then(() => {
				let refresh = this.get('refresh');
				refresh();
			});
		},

		onCopyPage(pageId, documentId) {
			let cb = this.get('onCopyPage');
			cb(pageId, documentId);
		},

		onMovePage(pageId, documentId) {
			let cb = this.get('onMovePage');
			cb(pageId, documentId);
		},

		onDeletePage(params) {
			let cb = this.get('onDeletePage');
			cb(params);
		},

		onSavePage(page, meta) {
			let document = this.get('document');
			let constants = this.get('constants');

			switch (document.get('protection')) {
				case constants.ProtectionType.Lock:
					break;
				case constants.ProtectionType.Review:
					// detect edits to newly created pending page
					if (page.get('relativeId') === '' && page.get('status') === constants.ChangeState.PendingNew) {
						// new page, edits
						this.set('toEdit', '');
						this.get('onSavePage')(page, meta);
					} else if (page.get('relativeId') !== '' && page.get('status') === constants.ChangeState.Published) {
						// existing page, first edit
						const promise = this.addSection({ page: page, meta: meta });
						promise.then((/*id*/) => { this.set('toEdit', ''); });
					} else if (page.get('relativeId') !== '' && page.get('status') === constants.ChangeState.Pending) {
						// existing page, subsequent edits
						this.set('toEdit', '');
						this.get('onSavePage')(page, meta);
					}
					break;
				case constants.ProtectionType.None:
					// for un-protected documents, edits welcome!
					this.set('toEdit', '');
					this.get('onSavePage')(page, meta);

					break;
			}
		},

		onShowSectionWizard(beforePage) {
			this.set('newSectionLocation', beforePage);
			this.set('showInsertSectionModal', true)
		},

		onShowDeleteBlockModal(id) {
			this.set('deleteBlockId', id);
			this.set('showDeleteBlockDialog', true);
		},

		onVote(vote) {
			this.get('documentService').vote(this.get('document.id'), vote);
			this.set('voteThanks', true);
		}
	}
});
