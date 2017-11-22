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
import { A } from "@ember/array"
import Component from '@ember/component';

export default Component.extend({
	showDeleteDialog: false,
	showMoveDialog: false,
	selectedDocuments: A([]),
	selectedCaption: 'document',

	showAdd: computed('permissions', 'documents', function() {
		return this.get('documents.length') === 0 && this.get('permissions.documentAdd');
	}),
	showLockout: computed('permissions', 'documents', function() {
		return this.get('documents.length') === 0 && !this.get('permissions.documentAdd');
	}),
	hasDocumentActions: computed('permissions', function() {
		return this.get('permissions.documentDelete') || this.get('permissions.documentMove');
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		let space = this.get('space');
		let targets = _.reject(this.get('spaces'), {id: space.get('id')});
		this.set('moveOptions', A(targets));
		this.set('selectedDocuments', A([]));
	},

    actions: {
		onShowDeleteDocuments() {
			this.set('showDeleteDialog', true);
		},

		onDeleteDocuments() {
			let list = this.get('selectedDocuments');
			this.set('selectedDocuments', A([]));
			this.set('showDeleteDialog', false);

			this.attrs.onDeleteDocument(list);

			return true;
		},

		onShowMoveDocuments() {
			this.set('showMoveDialog', true);
		},

		onMoveDocuments() {
			let list = this.get('selectedDocuments');
			let spaces = this.get('spaces');
			let moveSpaceId = '';

			spaces.forEach(space => {
				if (space.get('selected')) {
					moveSpaceId = space.get('id');
				}
			});

			if (moveSpaceId === '') return false;

			this.set('showMoveDialog', false);
			this.set('selectedDocuments', A([]));
			this.attrs.onMoveDocument(list, moveSpaceId);

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

			this.set('selectedCaption', list.length > 1 ? 'documents' : 'document');
			this.set('selectedDocuments', A(list));
        }
    }
});
