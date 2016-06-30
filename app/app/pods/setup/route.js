import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        let pwd = document.head.querySelector("[property=dbhash]").content;
        if (pwd.length === 0 || pwd === "{{.DBhash}}") {
            this.transitionTo('auth.login'); // don't allow access to this page if we are not in setup mode, kick them out altogether
        }

        this.session.clearSession();
    },

    model() {
        let pwd = document.head.querySelector("[property=dbhash]").content;

        return {
            dbname: document.head.querySelector("[property=dbname]").content,
            dbhash: pwd,
            title: "",
            message: "This Documize instance contains all our team documentation",
            allowAnonymousAccess: false,
            firstname: "",
            lastname: "",
            email: "",
            password: pwd
        };
    },

    activate() {
        document.title = "Setup Documize database '" + document.head.querySelector("[property=dbname]").content + "'";
    }
});
