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
import { empty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import Notifier from '../../mixins/notifier';
import Modals from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(Notifier, Modals, {
	documentService: service('document'),
	sectionService: service('section'),
	store: service(),
	newSectionName: '',
	newSectionNameMissing: empty('newSectionName'),
	show: false,
	modalId: '#add-section-modal',
	canEdit: computed('permissions', 'document.protection', function() {
		let canEdit = this.get('document.protection') !== this.get('constants').ProtectionType.Lock && this.get('permissions.documentEdit');
		return canEdit;
	}),
	hasBlocks: computed('blocks', function() {
		return this.get('blocks.length') > 0;
	}),

	// eslint-disable-next-line ember/no-observers
	onModalToggle: observer('show', function() {
		let modalId = this.get('modalId');

		if (this.get('show')) {
			this.modalOpen(modalId, {'show': true}, '#new-section-name');

			let self = this;
			$(modalId).one('hidden.bs.modal', function(e) { // eslint-disable-line no-unused-vars
				self.set('show', false);
			});
		} else {
			this.modalClose(modalId);
			$(modalId).modal('hide');
			$(modalId).modal('dispose');
		}
	}),

	addSection(model) {
		this.modalClose(this.get('modalId'));

		let sequence = 0;
		let level = 1;
		let beforePage = this.get('beforePage');
		let constants = this.get('constants');
		let pages = this.get('pages');

		// By default, we create page at the end of the document.
		if (pages.get('length') > 0 ) {
			let p = pages.get('lastObject');
			sequence = p.get('page.sequence') * 2;
			level = p.get('page.level');
		}

		// But, if we can work work correct placement, we put new content as best we can.
		if (_.isObject(beforePage)) {
			level = beforePage.get('level');

			// get any page before the beforePage so we can insert this new section between them
			let index = _.findIndex(this.get('pages'), function(item) { return item.get('page.id') === beforePage.get('id'); });

			if (index !== -1) {
				let beforeBeforePage = this.get('pages')[index-1];

				if (!_.isUndefined(beforeBeforePage)) {
					sequence = (beforePage.get('sequence') + beforeBeforePage.get('page.sequence')) / 2;
				} else {
					sequence = beforePage.get('sequence') / 2;
				}
			}
		}

		model.page.set('sequence', sequence);
		model.page.set('level', level);

		if (this.get('document.protection') === constants.ProtectionType.Review) {
			model.page.set('status', model.page.get('relativeId') === '' ? constants.ChangeState.PendingNew : constants.ChangeState.Pending);
		}

		return this.get('onInsertSection')(model);
	},

	actions: {
		onInsertSection(section) {
			let sectionName = this.get('newSectionName');
			if (_.isEmpty(sectionName)) {
				$("#new-section-name").focus();
				return;
			}

			let page = this.get('store').createRecord('page');
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

			this.set('newSectionName', '');

			const promise = this.addSection(model);
			promise.then((id) => {
				this.set('toEdit', model.page.pageType === 'section' ? id : '');
			});
		},

		onInsertBlock(block) {
			let sectionName = this.get('newSectionName');
			if (_.isEmpty(sectionName)) {
				$("#new-section-name").focus();
				return;
			}

			let page = this.get('store').createRecord('page');
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

			this.set('newSectionName', '');

			const promise = this.addSection(model);
			promise.then((id) => { // eslint-disable-line no-unused-vars
			});
		}
	}
});
