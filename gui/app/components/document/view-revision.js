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

import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(ModalMixin, {
	documentService: service('document'),
	revision: null,
	revisions: null,
	diff: '',
	hasRevisions: computed('revisions', function() {
		return this.get('revisions').length > 0;
	}),
	hasDiff: computed('diff', function() {
		return this.get('diff').length > 0;
	}),
	canRollback: computed('permissions.documentEdit', 'document.protection', function() {
		let constants = this.get('constants');

		if (this.get('document.protection') === constants.ProtectionType.Lock) return false;

		return this.get('permissions.documentEdit') &&
			this.get('document.protection') === constants.ProtectionType.None;
	}),

	init() {
		this._super(...arguments);
		this.revisions = [];
	},

	didReceiveAttrs() {
		this._super(...arguments);
		this.fetchRevisions();
	},

	fetchRevisions() {
		this.get('documentService').getDocumentRevisions(this.get('document.id')).then((revisions) => {
			revisions.forEach((r) => {
				set(r, 'deleted', r.revisions === 0);
				let date = moment(r.created).format('Do MMMM YYYY HH:mm');
				let format = `${r.firstname} ${r.lastname} on ${date} changed ${r.title}`;
				set(r, 'label', format);
			});

			this.set('revisions', revisions);

			if (revisions.length > 0 && is.null(this.get('revision'))) {
				this.send('onSelectRevision', revisions[0]);
			}
		});
	},

	fetchDiff(pageId, revisionId) {
		this.get('documentService').getPageRevisionDiff(this.get('document.id'), pageId, revisionId).then((revision) => {
			this.set('diff', revision);
		});
	},

	actions: {
		onSelectRevision(revision) {
			this.set('revision', revision);

			if (!revision.deleted) {
				this.fetchDiff(revision.pageId, revision.id);
			}
		},

		onRollback() {
			let revision = this.get('revision');
			let cb = this.get('onRollback');
			cb(revision.pageId, revision.id);

			this.modalClose('#document-rollback-modal');
		}
	}
});
