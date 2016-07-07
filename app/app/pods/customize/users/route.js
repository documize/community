import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
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
