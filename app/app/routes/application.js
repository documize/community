import Ember from 'ember';

export default Ember.Route.extend({
    userService: Ember.inject.service('user'),
    sessionService: Ember.inject.service('session'),
    transitioning: false,

    beforeModel: function(transition) {
        let self = this;
        let session = this.get('sessionService');

        // Session ready?
        return session.boot().then(function() {
            // Need to authenticate?
            if (!session.appMeta.allowAnonymousAccess && !session.authenticated &&
                is.not.startWith(transition.targetName, 'auth.')) {
                if (!self.transitioning) {
                    session.set('previousTransition', transition);
                    self.set('transitioning', true);
                }

                transition.abort();
                self.transitionTo('auth.login');
            }
        });
    },

    actions: {
        willTransition: function( /*transition*/ ) {
            Mousetrap.reset();
        },

        error(error, transition) { // jshint ignore: line
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    return this.transitionTo('auth.login');
                }
            }

            // Return true to bubble this event to any parent route.
            return true;
        }
    },
});