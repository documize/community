import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        this.session.clearSession();
    },

    model(params) {
        let token = params.token;

        if (is.undefined(token) || is.null(token) || token.length === 0) {
            return;
        }

        let self = this;

        this.session.sso(decodeURIComponent(token)).then(function() {
            self.transitionTo('folders.folder');
        }, function() {
            self.transitionTo('auth.login');
            console.log(">>>>> Documize SSO failure");
        });
    },
});