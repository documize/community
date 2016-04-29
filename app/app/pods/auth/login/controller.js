import Ember from 'ember';

export default Ember.Controller.extend({
    email: "",
    password: "",
    invalidCredentials: false,

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
            let self = this;
            let creds = this.getProperties('email', 'password');

            this.session.login(creds).then(function() {
                self.set('invalidCredentials', false);
                self.audit.record("logged-in");

                var previousTransition = self.session.get('previousTransition');

                if (previousTransition) {
                    previousTransition.retry();
                    self.session.set('previousTransition', null);
                } else {
                    self.transitionToRoute('folders.folder');
                }
            }, function() {
                self.set('invalidCredentials', true);
            });
        }
    }
});