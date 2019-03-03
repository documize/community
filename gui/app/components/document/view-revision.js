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

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(ModalMixin, {
	documentService: service('document'),
	diff: '',
	revision: null,
	hasDiff: computed('diff', function() {
		return this.get('diff').length > 0;
	}),
	canRollback: computed('permissions.documentEdit', 'document.protection', function() {
		let constants = this.get('constants');

		if (this.get('document.protection') === constants.ProtectionType.Lock) return false;

		return this.get('permissions.documentEdit') &&
			this.get('document.protection') === constants.ProtectionType.None;
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		let revision = this.get('revision');

		if (!_.isNull(revision)) {
			if (!revision.deleted) {
				this.fetchDiff(revision.pageId, revision.id);
			}
		}
},

	fetchDiff(pageId, revisionId) {
		this.get('documentService').getPageRevisionDiff(this.get('document.id'), pageId, revisionId).then((revision) => {
			this.set('diff', revision);
		});
	},

	actions: {
		onShowModal() {
			this.modalOpen('#document-rollback-modal', {show:true});
		},

		onRollback() {
			let revision = this.get('revision');
			let cb = this.get('onRollback');
			cb(revision.pageId, revision.id);

			this.modalClose('#document-rollback-modal');
		}
	}
});
