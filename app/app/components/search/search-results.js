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
            documents.pushObject( {
                doc: document[0],
                ref: document
            });
        });

        let phrase = 'Nothing found';

        if (results.length > 0) {
            let places = documents.length === 1 ? "place" : "places";
            let references = results.length === 1 ? "secton" : "sections";
            let i = results.length;
            let j = documents.length;
            phrase = `${i} ${references} in ${j} ${places}`;
        }

        this.set('resultPhrase', phrase);
        this.set('documents', documents);
    }
});
