import Ember from 'ember';

export default Ember.Route.extend({
    userService: Ember.inject.service('user'),

    beforeModel: function() {
        if (!this.session.isAdmin) {
            this.transitionTo('auth.login');
        }
    },

    model: function() {
        return this.get('userService').getAll();
    },

    activate: function() {
        document.title = "Users | Documize";
    }
});
