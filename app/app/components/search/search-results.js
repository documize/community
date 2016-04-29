// Copyright (c) 2015 Documize Inc.
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
