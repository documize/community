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
	showAdd: computed('permissions', 'documents', function() {
		return this.get('documents.length') === 0 && this.get('permissions.documentAdd');
	}),
	showLockout: computed('permissions', 'documents', function() {
		return this.get('documents.length') === 0 && !this.get('permissions.documentAdd');
	}),

    actions: {
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
