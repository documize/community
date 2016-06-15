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
    selectedDocuments: [],

    didReceiveAttrs() {
        this.set('selectedDocuments', []);
		this.audit.record('viewed-space');
    },

    actions: {
        selectDocument(documentId) {
            let doc = this.get('documents').findBy('id', documentId);
            let list = this.get('selectedDocuments');

            doc.set('selected', !doc.get('selected'));

            if (doc.get('selected')) {
                list.push(documentId);
            } else {
                var index = list.indexOf(documentId);
                if (index > -1) {
                    list.splice(index, 1);
                }
            }

            this.set('selectedDocuments', list);
            this.get('onDocumentsChecked')(list);
        }
    }
});
