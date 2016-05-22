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
        let count = this.get('results').length;
        let self = this;

        switch (count) {
            case 0:
                self.set("resultPhrase", "No results.");
                break;
            case 1:
                self.set("resultPhrase", "1 reference found");
                break;
            default:
                self.set("resultPhrase", `${count} references found`);
        }
    }
});