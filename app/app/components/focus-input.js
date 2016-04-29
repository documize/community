import Ember from 'ember';

export default Ember.TextField.extend({
    becomeFocused: function() {
        this.$().focus();
    }.on('didInsertElement')
});
