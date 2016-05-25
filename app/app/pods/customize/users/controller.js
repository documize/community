import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    userService: Ember.inject.service('user'),
    newUser: { firstname: "", lastname: "", email: "", active: true },

    actions: {
        add: function() {
            if (is.empty(this.newUser.firstname)) {
                $("#newUserFirstname").addClass("error").focus();
                return;
            }
            if (is.empty(this.newUser.lastname)) {
                $("#newUserLastname").addClass("error").focus();
                return;
            }
            if (is.empty(this.newUser.email) || is.not.email(this.newUser.email)) {
                $("#newUserEmail").addClass("error").focus();
                return;
            }

			$("#newUserFirstname").removeClass("error");
			$("#newUserLastname").removeClass("error");
			$("#newUserEmail").removeClass("error");

            this.get('userService')
                .add(this.get('newUser'))
                .then((user) => {
                    this.showNotification('Added');
                    this.set('newUser', { firstname: "", lastname: "", email: "", active: true });
                    $("#newUserFirstname").focus();
                    this.get('model').pushObject(user);
                })
                .catch(function(){
                    let msg = error.status === 409 ? 'Unable to add duplicate user' : 'Unable to add user';
                    self.showNotification(msg);
                });
        },

        onDelete(user) {
            let self = this;
            this.get('userService').remove(user.get('id')).then(function(){
                self.showNotification('Deleted');

                self.get('userService').getAll().then(function(users) {
                    self.set('model', users);
                });
            });
        },

        onSave(user) {
            let self = this;
            this.get('userService').save(user).then(function(){
                self.showNotification('Saved');

                self.get('userService').getAll().then(function(users) {
                    self.set('model', users);
                });
            });
        },

        onPassword(user, password) {
            this.get('userService').updatePassword(user.get('id'), password);
			this.showNotification('Password changed');
        }
    }
});
