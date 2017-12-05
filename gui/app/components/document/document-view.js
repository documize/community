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

import { notEmpty, empty } from '@ember/object/computed';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';

export default Component.extend(NotifierMixin, TooltipMixin, {
	documentService: service('document'),
	sectionService: service('section'),
	appMeta: service(),
	link: service(),
	hasPages: notEmpty('pages'),
	newSectionName: 'Section',
	newSectionNameMissing: empty('newSectionName'),
	newSectionLocation: '',
	beforePage: '',
	toEdit: '',

	didReceiveAttrs() {
		this._super(...arguments);
		this.loadBlocks();

		schedule('afterRender', () => {
			let jumpTo = "#page-" + this.get('pageId');
			if (!$(jumpTo).inView()) {
				$(jumpTo).velocity("scroll", { duration: 250, offset: -100 });
			}
		});
	},

	didRender() {
		this._super(...arguments);
		this.contentLinkHandler();
	},

	didInsertElement() {
		this._super(...arguments);
		this.setupAddWizard();

		let self = this;
		$(".tooltipped").each(function(i, el) {
			self.addTooltip(el);
		});
	},

	willDestroyElement() {
		this._super(...arguments);
		$('.start-section:not(.start-section-empty-state)').off('.hoverIntent');

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
				let exists = self.get('pages').findBy('id', link.targetId);

				if (_.isUndefined(exists)) {
					link.orphan = true;
				} else {
					if (link.linkType === "section") {
						self.attrs.onGotoPage(link.targetId);
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
		// calculate sequence of page (position in document)
		let sequence = 0;
		let level = 1;
		let beforePage = this.get('beforePage');

		if (is.not.null(beforePage)) {
			level = beforePage.get('level');

			// get any page before the beforePage so we can insert this new section between them
			let index = _.findIndex(this.get('pages'), function(p) { return p.get('id') === beforePage.get('id'); });

			if (index !== -1) {
				let beforeBeforePage = this.get('pages')[index-1];

				if (is.not.undefined(beforeBeforePage)) {
					sequence = (beforePage.get('sequence') + beforeBeforePage.get('sequence')) / 2;
				} else {
					sequence = beforePage.get('sequence') / 2;
				}
			}
		}

		model.page.sequence = sequence;
		model.page.level = level;

		this.send('onHideSectionWizard');

		return this.get('onInsertSection')(model);
	},

	loadBlocks() {
		this.get('sectionService').getSpaceBlocks(this.get('folder.id')).then((blocks) => {
			if (this.get('isDestroyed') || this.get('isDestroying')) {
				return;
			}

			this.set('blocks', blocks);
			this.set('hasBlocks', blocks.get('length') > 0);

			blocks.forEach((b) => {
				b.set('deleteId', `delete-block-button-${b.id}`);
			});
		});
	},

	actions: {
		onSavePageAsBlock(block) {
			const promise = this.attrs.onSavePageAsBlock(block);
			promise.then(() => {
				this.loadBlocks();
			});
		},

		onCopyPage(pageId, documentId) {
			this.attrs.onCopyPage(pageId, documentId);
		},

		onMovePage(pageId, documentId) {
			this.attrs.onMovePage(pageId, documentId);
		},

		onDeletePage(params) {
			this.attrs.onDeletePage(params);
		},

		onSavePage(page, meta) {
			this.set('toEdit', '');
			this.attrs.onSavePage(page, meta);
		},

		onShowSectionWizard(page) {
			if (is.undefined(page)) {
				page = { id: '0' };
			}

			this.set('pageId', '');

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

			let page = {
				documentId: this.get('document.id'),
				title: sectionName,
				level: 1,
				sequence: 0, // calculated elsewhere
				body: "",
				contentType: section.get('contentType'),
				pageType: section.get('pageType')
			};

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
				this.set('pageId', id);

				if (model.page.pageType === 'section') {
					this.set('toEdit', id);
				} else {
					this.set('toEdit', '');
				}

				this.setupAddWizard();
			});
		},

		onInsertBlock(block) {
			let sectionName = this.get('newSectionName');
			if (is.empty(sectionName)) {
				$("#new-section-name").focus();
				return;
			}

			let page = {
				documentId: this.get('document.id'),
				title: `${block.get('title')}`,
				level: 1,
				sequence: 0, // calculated elsewhere
				body: block.get('body'),
				contentType: block.get('contentType'),
				pageType: block.get('pageType'),
				blockId: block.get('id')
			};

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
			promise.then((id) => {
				this.set('pageId', id);

				this.setupAddWizard();
			});
		},

		onDeleteBlock(id) {
			const promise = this.attrs.onDeleteBlock(id);

			promise.then(() => {
				this.loadBlocks();
			});

			return true;
		}
	}
});
