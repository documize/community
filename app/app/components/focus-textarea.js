import Ember from 'ember';

export default Ember.TextArea.extend({
    becomeFocused: function() {
        this.$().focus();
    }.on('didInsertElement')
});
