/*global is*/
import Ember from 'ember';

export default Ember.Controller.extend({
    userService: Ember.inject.service('user'),
    email: "",
    sayThanks: false,

    actions: {
        forgot: function()
        {
            var self = this;
            var email = this.get('email');

            if (is.empty(email)) {
				$("#email").addClass("error").focus();
                return;
            }

            self.set('sayThanks', true);
            this.set('email', '');

            this.get('userService').forgotPassword(email);
        }
    }
});
