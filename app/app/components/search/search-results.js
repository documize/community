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
    results: [],
    resultPhrase: "",

    didReceiveAttrs() {
        let results = this.get('results');
        let temp = _.groupBy(results, 'documentId');
        let documents = [];

        _.each(temp, function(document) {
			let refs = [];

			if (document.length > 1) {
				refs = document.slice(1);
			}

			_.each(refs, function(ref, index) {
				ref.comma = index === refs.length-1 ? "" : ", ";
			});

			let hasRefs = refs.length > 0;

            documents.pushObject( {
                doc: document[0],
                ref: refs,
				hasReferences: hasRefs
            });
        });

        let phrase = 'Nothing found';

        if (results.length > 0) {
            let references = results.length === 1 ? "reference" : "references";
            let i = results.length;
            let j = documents.length;
            phrase = `${i} ${references}`;
        }

        this.set('resultPhrase', phrase);
        this.set('documents', documents);
    }
});
