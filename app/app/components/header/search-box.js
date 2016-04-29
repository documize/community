import Ember from 'ember';

export default Ember.Component.extend({
    filter: "",

    didInitAttrs() {
        this.get('onFilter')(this.get('filter'));
    },

    onKeywordChange: function() {
        Ember.run.debounce(this, this.fetch, 750);
    }.observes('filter'),

    fetch() {
        this.get('onFilter')(this.get('filter'));
    },
});
