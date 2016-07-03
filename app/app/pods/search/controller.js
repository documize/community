// Copyright (c) 2015 Documize Inc.
import Ember from 'ember';

export default Ember.Controller.extend({
    searchService: Ember.inject.service('search'),
    queryParams: ['filter'],
    filter: "",
    results: [],

	onKeywordChange: function() {
        Ember.run.debounce(this, this.fetch, 750);
    }.observes('filter'),

    fetch() {
        this.audit.record('searched');
        let self = this;

        this.get('searchService').find(this.get('filter')).then(function(response) {
            self.set('results', response);
        });
    }
});
