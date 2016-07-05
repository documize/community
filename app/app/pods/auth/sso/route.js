import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service(),

    model({ token }) {
        this.get("session").authenticate('authenticator:documize', token)
            .then(() => {
                this.transitionTo('folders.folder');
            }, () => {
                this.transitionTo('auth.login');
                console.log(">>>>> Documize SSO failure");
            });
    },
});
