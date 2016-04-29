import Ember from 'ember';

export default Ember.Service.extend({
    action: function(entry) {
        console.log(entry);
    },

    error: function(entry) {
        console.log(entry);
    },

    info: function(entry) {
        console.log(entry);
    }
});
