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
	revision: null,
	hasDiff: Ember.computed('diff', function () {
		return this.get('diff').length > 0;
	}),

	didReceiveAttrs() {
		let revisions = this.get('revisions');

		revisions.forEach((r) => {
			Ember.set(r, 'deleted', r.revisions === 0);
			Ember.set(r, 'label', `${r.created} - ${r.firstname} ${r.lastname} - ${r.title}`);
		});

		if (revisions.length > 0 && is.null(this.get('revision'))) {
			this.send('onSelectRevision', revisions[0]);
		}

		this.set('revisions', revisions);
	},

	actions: {
		onSelectRevision(revision) {
			this.set('revision', revision);

			if (!revision.deleted) {
				this.attrs.onFetchDiff(revision.pageId, revision.id);
			}
		},

		onRollback() {
			let revision = this.get('revision');
			this.attrs.onRollback(revision.pageId, revision.id);
		}
	}
});
