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

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend({
	link: service(),
	hasSections: false,
	hasAttachments: false,
	linkName: '',
	selection: null,

	init() {
		this._super(...arguments);
		let self = this;

		let documentId = this.get('document.id');
		let pageId = this.get('page.id');

		this.get('link').getCandidates(documentId, pageId).then(function (candidates) {
			self.set('candidates', candidates);
			self.set('hasSections', is.not.null(candidates.pages) && candidates.pages.length);
			self.set('hasAttachments', is.not.null(candidates.attachments) && candidates.attachments.length);
		});
	},

	didReceiveAttrs() {},

	didInsertElement() {},

	willDestroyElement() {},

	actions: {
		onInsertLink() {
			let selection = this.get('selection');
			let linkName = this.get('linkName');

			if (linkName.length) {
				selection.title = linkName;
			}

			if (is.not.null(selection)) {
				this.get('onInsertLink')(selection);
			}
		}
	}
});
