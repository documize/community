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
import Component from '@ember/component';

export default Component.extend({
	showDeleteDialog: false,
	selectedDocuments: [],

	showAdd: computed('permissions', 'documents', function() {
		return this.get('documents.length') === 0 && this.get('permissions.documentAdd');
	}),
	showLockout: computed('permissions', 'documents', function() {
		return this.get('documents.length') === 0 && !this.get('permissions.documentAdd');
	}),
	hasDocumentActions: computed('permissions', function() {
		return this.get('permissions.documentDelete') || this.get('permissions.documentMove');
	}),

    actions: {
		onConfirmDeleteDocuments() {
			this.set('showDeleteDialog', true);
		},

		onDeleteDocuments() {
			this.set('showDeleteDialog', false);
			let list = this.get('selectedDocuments');

			// list.forEach(d => {
			// 	let doc = this.get('documents').findBy('id', d);
			// 	doc.set('selected', false);
			// });

			this.attrs.onDeleteDocument(list);

			this.set('selectedDocuments', []);

			return true;
		},

        selectDocument(documentId) {
            let doc = this.get('documents').findBy('id', documentId);
            let list = this.get('selectedDocuments');

            doc.set('selected', !doc.get('selected'));

            if (doc.get('selected')) {
				list.pushObject(documentId);
            } else {
				list = _.without(list, documentId);
			}

			this.set('selectedDocuments', list);
        }
    }
});
