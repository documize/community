import Ember from 'ember';

const {
	isEmpty,
	computed,
	set,
	get
} = Ember;

export default Ember.Component.extend({
	newUser: { firstname: "", lastname: "", email: "", active: true },
	firstnameEmpty: computed.empty('newUser.firstname'),
	lastnameEmpty: computed.empty('newUser.lastname'),
	emailEmpty: computed.empty('newUser.email'),
	hasFirstnameEmptyError: computed.and('firstnameEmpty', 'firstnameError'),
	hasLastnameEmptyError: computed.and('lastnameEmpty', 'lastnameError'),
	hasEmailEmptyError: computed.and('emailEmpty', 'emailError'),

	actions: {
		add() {
			if (isEmpty(this.newUser.firstname)) {
				set(this, 'firstnameError', true);
				return $("#newUserFirstname").focus();
			}
			if (isEmpty(this.newUser.lastname)) {
				set(this, 'lastnameError', true);
				return $("#newUserLastname").focus();
			}
			if (isEmpty(this.newUser.email) || is.not.email(this.newUser.email)) {
				set(this, 'emailError', true);
				return $("#newUserEmail").focus();
			}

			let user = get(this, 'newUser');

			get(this, 'add')(user).then(() => {
				this.set('newUser', { firstname: "", lastname: "", email: "", active: true });
				set(this, 'firstnameError', false);
				set(this, 'lastnameError', false);
				set(this, 'emailError', false);
				$("#newUserFirstname").focus();
			});
		}
	}
});
