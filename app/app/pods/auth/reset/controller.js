/*global is*/
import Ember from 'ember';

export default Ember.Controller.extend({
    userService: Ember.inject.service('user'),
    password: "",
    passwordConfirm: "",
    mustMatch: false,

    actions: {
        reset() {
            let self = this;
            let password = this.get('password');
            let passwordConfirm = this.get('passwordConfirm');

            if (is.empty(password)) {
				$("#newPassword").addClass("error").focus();
                return;
            }

			if (is.empty(passwordConfirm)) {
				$("#passwordConfirm").addClass("error").focus();
				return;
			}

            if (is.not.equal(password, passwordConfirm)) {
				$("#newPassword").addClass("error").focus();
				$("#passwordConfirm").addClass("error");
                self.set('mustMatch', true);
                return;
            }

            this.get('userService').resetPassword(self.model, password).then(function(response) { /* jshint ignore:line */
                self.transitionToRoute('auth.login');
            });
        }
    }
});
