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
import { debounce } from '@ember/runloop';
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import stringUtil from '../../utils/string';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(ModalMixin, {
	link: service(),
	linkName: '',
	selection: null,
	tab1Selected: true,
	tab2Selected: false,
	tab3Selected: false,
	showSections: computed('tab1Selected', function() { return this.get('tab1Selected'); }),
	showAttachments: computed('tab2Selected', function() { return this.get('tab2Selected'); }),
	showSearch: computed('tab3Selected', function() { return this.get('tab3Selected'); }),
	showNetwork: computed('tab4Selected', function() { return this.get('tab4Selected'); }),
	networkLocation: '',
	keywords: '',
	hasMatches: computed('matches', function () {
		let m = this.get('matches');
		return m.documents.length || m.pages.length || m.attachments.length;
	}),
	modalId: computed('page', function() { return '#content-linker-modal-' + this.get('page.id'); }),
	showModal: false,

	init() {
		this._super(...arguments);
		this.matches = {
			documents: [],
			pages: [],
			attachments: []
		};
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let modalId = this.get('modalId');

		if (!this.get('showModal')) {
			this.modalClose(modalId);
			return;
		}

		let self = this;
		let folderId = this.get('folder.id');
		let documentId = this.get('document.id');
		let pageId = this.get('page.id');

		this.get('link').getCandidates(folderId, documentId, pageId).then(function (candidates) {
			self.set('candidates', candidates);
			self.set('hasSections', !_.isNull(candidates.pages) && candidates.pages.length);
			self.set('hasAttachments', !_.isNull(candidates.attachments) && candidates.attachments.length);

			if (!self.get('hasSections') && !self.get('hasAttachments')) {
				self.set('tab1Selected', false);
				self.set('tab2Selected', false);
				self.set('tab3Selected', true);
				self.set('tab4Selected', false);
			}
		});

		this.modalOpen(modalId, {show: true});

		this.modalOnHide(modalId, () => {
			this.set('showModal', false);
		});
	},

	didRender() {
		this._super(...arguments);

		$('#content-linker-networklocation').removeClass('is-invalid');
	},

	willDestroyElement() {
		this._super(...arguments);
		this.set('showModal', false);
		this.modalClose(this.get('modalId'));
	},

	fetch() {
		let keywords = this.get('keywords');
		let self = this;

		if (_.isEmpty(keywords)) {
			this.set('matches', { documents: [], pages: [], attachments: [] });
			return;
		}

		this.get('link').searchCandidates(keywords).then(function (matches) {
			self.set('matches', matches);
		});
	},

	actions: {
		onSearch() {
			debounce(this, this.fetch, 750);
		},

		setSelection(i) {
			let candidates = this.get('candidates');
			let matches = this.get('matches');

			this.set('selection', i);

			candidates.pages.forEach(c => { set(c, 'selected', c.id === i.id); });
			candidates.attachments.forEach(c => { set(c, 'selected', c.id === i.id); });
			matches.documents.forEach(c => { set(c, 'selected', c.id === i.id); });
			matches.pages.forEach(c => { set(c, 'selected', c.id === i.id); });
			matches.attachments.forEach(c => { set(c, 'selected', c.id === i.id); });
		},

		onCancel() {
			this.set('showModal', false);
		},

		onInsertLink() {
			let selection = this.get('selection');

			if (this.get('tab4Selected')) {
				let loc = this.get('networkLocation').trim();
				let folderId = this.get('folder.id');
				let documentId = this.get('document.id');

				selection = {
					context: '',
					documentId: documentId,
					spaceId: folderId,
					id: stringUtil.makeId(16),
					linkType: 'network',
					targetId: '',
					externalId: loc,
					title: loc
				}
			}

			if (_.isNull(selection)) {
				if (this.get('tab4Selected')) $('#content-linker-networklocation').addClass('is-invalid').focus();
				return;
			}

			this.get('onInsertLink')(selection);
		},

		onTabSelect(id) {
			this.set('tab1Selected', id === 1);
			this.set('tab2Selected', id === 2);
			this.set('tab3Selected', id === 3);
			this.set('tab4Selected', id === 4);
		}
	}
});
