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

export default Ember.Component.extend({
	revision: {},
	hasDiff: Ember.computed('diff', function () {
		return this.get('diff').length > 0;
	}),

	didReceiveAttrs() {
		let revisions = this.get('revisions');

		revisions.forEach((revision) => {
			Ember.set(revision, 'deleted', revision.revisions === 0);
		});

		this.set('revisions', revisions);
	},

	didInsertElement() {
		this._super(...arguments);

		this.eventBus.subscribe('resized', this, 'sizeSidebar');
		this.sizeSidebar();
	},

	willDestroyElement() {
		this.eventBus.unsubscribe('resized');
	},

	sizeSidebar() {
		let size = $(window).height() - 200;
		this.$('.document-history > .sidebar').css('height', size + "px");
	},

	actions: {
		getDiff(revision) {
			this.set('revision', revision);
			if (!revision.deleted) {
				this.attrs.onFetchDiff(revision.pageId, revision.id);
			}
		},

		rollback() {
			let revision = this.get('revision');
			this.attrs.onRollback(revision.pageId, revision.id);
		}
	}
});
