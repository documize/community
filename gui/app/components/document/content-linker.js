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

import { debounce } from '@ember/runloop';
import { computed, set } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import TooltipMixin from '../../mixins/tooltip';

export default Component.extend(TooltipMixin, {
	link: service(),
	linkName: '',
	keywords: '',
	selection: null,
	matches: {
		documents: [],
		pages: [],
		attachments: []
	},
	tabs: [
		{ label: 'Section', selected: true },
		{ label: 'Attachment', selected: false },
		{ label: 'Search', selected: false }
	],
	contentLinkerButtonId: computed('page', function () {
		let page = this.get('page');
		return `content-linker-button-${page.id}`;
	}),

	showSections: computed('tabs.@each.selected', function () {
		return this.get('tabs').findBy('label', 'Section').selected;
	}),
	showAttachments: computed('tabs.@each.selected', function () {
		return this.get('tabs').findBy('label', 'Attachment').selected;
	}),
	showSearch: computed('tabs.@each.selected', function () {
		return this.get('tabs').findBy('label', 'Search').selected;
	}),
	hasMatches: computed('matches', function () {
		let m = this.get('matches');
		return m.documents.length || m.pages.length || m.attachments.length;
	}),

	init() {
		this._super(...arguments);
		let self = this;

		let folderId = this.get('folder.id');
		let documentId = this.get('document.id');
		let pageId = this.get('page.id');

		this.get('link').getCandidates(folderId, documentId, pageId).then(function (candidates) {
			self.set('candidates', candidates);
			self.set('hasSections', is.not.null(candidates.pages) && candidates.pages.length);
			self.set('hasAttachments', is.not.null(candidates.attachments) && candidates.attachments.length);
		});
	},

	didRender() {
		this.addTooltip(document.getElementById("content-linker-button"));
		this.addTooltip(document.getElementById("content-counter-button"));
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	onKeywordChange: function () {
		debounce(this, this.fetch, 750);
	}.observes('keywords'),

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
		setSelection(i) {
			let candidates = this.get('candidates');
			let matches = this.get('matches');

			this.set('selection', i);

			candidates.pages.forEach(c => {
				set(c, 'selected', c.id === i.id);
			});

			candidates.attachments.forEach(c => {
				set(c, 'selected', c.id === i.id);
			});

			matches.documents.forEach(c => {
				set(c, 'selected', c.id === i.id);
			});

			matches.pages.forEach(c => {
				set(c, 'selected', c.id === i.id);
			});

			matches.attachments.forEach(c => {
				set(c, 'selected', c.id === i.id);
			});
		},

		onInsertLink() {
			let selection = this.get('selection');

			if (is.null(selection)) {
				return;
			}

			return this.get('onInsertLink')(selection);
		},

		onTabSelect(tabs) {
			this.set('tabs', tabs);
		}
	}
});
