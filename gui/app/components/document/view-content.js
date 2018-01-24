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
import { notEmpty, empty } from '@ember/object/computed';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import TooltipMixin from '../../mixins/tooltip';
import models from '../../utils/model';

export default Component.extend(TooltipMixin, {
	documentService: service('document'),
	sectionService: service('section'),
	appMeta: service(),
	link: service(),
	hasPages: notEmpty('pages'),
	newSectionName: '',
	newSectionNameMissing: empty('newSectionName'),
	newSectionLocation: '',
	beforePage: null,
	toEdit: '',
	showDeleteBlockDialog: false,
	deleteBlockId: '',
	canEdit: computed('permissions', 'document.protection', function() {
		let canEdit = this.get('document.protection') !== this.get('constants').ProtectionType.Lock && this.get('permissions.documentEdit');

		if (canEdit) this.setupAddWizard();
		return canEdit;
	}),
	hasBlocks: computed('blocks', function() {
		return this.get('blocks.length') > 0;
	}),

	didRender() {
		this._super(...arguments);
		this.contentLinkHandler();
	},

	didInsertElement() {
		this._super(...arguments);

		if (this.get('session.authenticated')) {
			this.setupAddWizard();
			this.renderTooltips();
		}
	},

	willDestroyElement() {
		this._super(...arguments);

		if (this.get('session.authenticated')) {
			$('.start-section:not(.start-section-empty-state)').off('.hoverIntent');
			this.removeTooltips();
		}
	},

	contentLinkHandler() {
		let links = this.get('link');
		let doc = this.get('document');
		let self = this;

		$("a[data-documize='true']").off('click').on('click', function (e) {
			let link = links.getLinkObject(self.get('links'), this);

			// local link? exists?
			if ((link.linkType === "section" || link.linkType === "tab") && link.documentId === doc.get('id')) {
				let exists = self.get('pages').findBy('id', link.targetId);

				if (_.isUndefined(exists)) {
					link.orphan = true;
				} else {
					if (link.linkType === "section") {
						this.get('browser').scrollTo(`#page-${link.targetId}`);
					}
				}
			}

			if (link.orphan) {
				$(this).addClass('broken-link');
				e.preventDefault();
				e.stopPropagation();
				return false;
			}

			links.linkClick(doc, link);
			return false;
		});
	},

	setupAddWizard() {
		schedule('afterRender', () => {
			$('.start-section:not(.start-section-empty-state)').off('.hoverIntent');

			$('.start-section:not(.start-section-empty-state)').hoverIntent({interval: 100, over: function() {
				// in
				$(this).find('.start-button').velocity("transition.slideDownIn", {duration: 300});
			}, out: function() {
				// out
				$(this).find('.start-button').velocity("transition.slideUpOut", {duration: 300});
			} });
		});
	},

	addSection(model) {
		let sequence = 0;
		let level = 1;
		let beforePage = this.get('beforePage');
		let constants = this.get('constants');

		// calculate sequence of page (position in document)
		if (is.not.null(beforePage)) {
			level = beforePage.get('level');

			// get any page before the beforePage so we can insert this new section between them
			let index = _.findIndex(this.get('pages'), function(item) { return item.get('page.id') === beforePage.get('id'); });

			if (index !== -1) {
				let beforeBeforePage = this.get('pages')[index-1];

				if (is.not.undefined(beforeBeforePage)) {
					sequence = (beforePage.get('sequence') + beforeBeforePage.get('page.sequence')) / 2;
				} else {
					sequence = beforePage.get('sequence') / 2;
				}

				model.page.set('sequence', sequence);
				model.page.set('level', level);
			}
		}

		if (this.get('document.protection') === constants.ProtectionType.Review) {
			model.page.set('status', model.page.get('relativeId') === '' ? constants.ChangeState.PendingNew : constants.ChangeState.Pending);
		}

		this.send('onHideSectionWizard');

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
						let cb = this.get('onSavePage');
						cb(page, meta);
					} else if (page.get('relativeId') !== '' && page.get('status') === constants.ChangeState.Published) {
						// existing page, first edit
						const promise = this.addSection({ page: page, meta: meta });
						promise.then((/*id*/) => { this.set('toEdit', ''); });
					} else if (page.get('relativeId') !== '' && page.get('status') === constants.ChangeState.Pending) {
						// existing page, subsequent edits
						this.set('toEdit', '');
						let cb = this.get('onSavePage');
						cb(page, meta);
					}
					break;
				case constants.ProtectionType.None:
					// for un-protected documents, edits welcome!
					this.set('toEdit', '');
					// let cb2 = this.get('onSavePage');
					// cb2(page, meta);
					this.attrs.onSavePage(page, meta); // eslint-disable-line ember/no-attrs-in-components
					
					break;
			}
		},

		onShowSectionWizard(page) {
			if (is.undefined(page)) page = { id: '0' };

			let beforePage = this.get('beforePage');
			if (is.not.null(beforePage) && $("#new-section-wizard").is(':visible') && beforePage.get('id') === page.id) {
				this.send('onHideSectionWizard');
				return;
			}

			this.set('newSectionLocation', page.id);

			if (page.id === '0') {
				// this handles add section at the end of the document
				// because we are not before another page
				this.set('beforePage', null);
			} else {
				this.set('beforePage', page);
			}

			$("#new-section-wizard").insertAfter(`#add-section-button-${page.id}`);
			$("#new-section-wizard").velocity("transition.slideDownIn", { duration: 300, complete:
				function() {
					$("#new-section-name").focus();
				}});
		},

		onHideSectionWizard() {
			this.set('newSectionLocation', '');
			this.set('beforePage', null);
			$("#new-section-wizard").insertAfter('#wizard-placeholder');
			$("#new-section-wizard").velocity("transition.slideUpOut", { duration: 300 });
		},

		onInsertSection(section) {
			let sectionName = this.get('newSectionName');
			if (is.empty(sectionName)) {
				$("#new-section-name").focus();
				return;
			}

			let page = models.PageModel.create();
			page.set('documentId', this.get('document.id'));
			page.set('title', sectionName);
			page.set('contentType', section.get('contentType'));
			page.set('pageType', section.get('pageType'));

			let meta = {
				documentId: this.get('document.id'),
				rawBody: "",
				config: ""
			};

			let model = {
				page: page,
				meta: meta
			};

			const promise = this.addSection(model);
			promise.then((id) => {
				this.set('toEdit', model.page.pageType === 'section' ? id: '');
				this.setupAddWizard();
			});
		},

		onInsertBlock(block) {
			let sectionName = this.get('newSectionName');
			if (is.empty(sectionName)) {
				$("#new-section-name").focus();
				return;
			}

			let page = models.PageModel.create();
			page.set('documentId', this.get('document.id'));
			page.set('title', `${block.get('title')}`);
			page.set('body', block.get('body'));
			page.set('contentType', block.get('contentType'));
			page.set('pageType', block.get('pageType'));
			page.set('blockId', block.get('id'));

			let meta = {
				documentId: this.get('document.id'),
				rawBody: block.get('rawBody'),
				config: block.get('config'),
				externalSource: block.get('externalSource')
			};

			let model = {
				page: page,
				meta: meta
			};

			const promise = this.addSection(model);
			promise.then((/*id*/) => {
				this.setupAddWizard();
			});
		},

		onShowDeleteBlockModal(id) {
			this.set('deleteBlockId', id);
			this.set('showDeleteBlockDialog', true);
		},

		onDeleteBlock() {
			this.set('showDeleteBlockDialog', false);

			let id = this.get('deleteBlockId');

			let cb = this.get('onDeleteBlock');
			let promise = cb(id);

			promise.then(() => {
				this.set('deleteBlockId', '');
				let refresh = this.get('refresh');
				refresh();
			});

			return true;
		}
	}
});
