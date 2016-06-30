import Ember from 'ember';

export default Ember.Controller.extend({
    email: "",
    password: "",
    invalidCredentials: false,
    session: Ember.inject.service('session'),
    audit: Ember.inject.service('audit'),

    reset() {
        this.setProperties({
            email: "",
            password: ""
        });

        let dbhash = document.head.querySelector("[property=dbhash]").content;
        if (dbhash.length > 0 && dbhash !== "{{.DBhash}}") {
            this.transitionToRoute('setup');
        }

    },

    actions: {
        login() {
            let creds = this.getProperties('email', 'password');

            this.get('session').authenticate('authenticator:documize', creds)
                .then((response) => {
                    this.get('audit').record("logged-in");
                    this.transitionToRoute('folders.folder');
                    return response;
                }).catch(() => {
                    this.set('invalidCredentials', true);
                });
        }
    }
});
