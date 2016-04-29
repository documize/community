// Copyright (c) 2015 Documize Inc.
import Ember from 'ember';

export default Ember.Controller.extend({
    searchService: Ember.inject.service('search'),
    queryParams: ['filter'],
    filter: "",
    results: [],

    filterResults(filter) {
        this.audit.record('searched');
        let self = this;

        this.get('searchService').find(filter).then(function(response) {
            self.set('results', response);
        });
    },

    actions: {
        onFilter(filter) {
            this.filterResults(filter);
        }
    }
});
