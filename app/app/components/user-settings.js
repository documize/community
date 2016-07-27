import Ember from 'ember';

const {
	isPresent,
	isEmpty,
	computed,
	set,
	get
} = Ember;

export default Ember.Component.extend({
	newUser: { firstname: "", lastname: "", email: "", active: true },
	userFirstnameError: computed('firstnameError', 'newUser.firstname', {
		get() {
			let error = get(this, 'firstnameError');
			let firstname = get(this, 'newUser.firstname');
			if (isPresent(error) && isEmpty(firstname)) {
				return `error`;
			}

			return;
		}
	}),
	userLastnameError: computed('lastnameError', 'newUser.lastname', {
		get() {
			let error = get(this, 'lastnameError');
			let lastname = get(this, 'newUser.lastname');
			if (isPresent(error) && isEmpty(lastname)) {
				return `error`;
			}

			return;
		}
	}),
	userEmailError: computed('emailError', 'newUser.email', {
		get() {
			let error = get(this, 'emailError');
			let email = get(this, 'newUser.email');
			if (isPresent(error)) {
				return `error`;
			}

			return;
		}
	}),

	actions: {
		add() {
			if (isEmpty(this.newUser.firstname)) {
				set(this, 'firstnameError', 'error');
				return $("#newUserFirstname").focus();
			}
			if (isEmpty(this.newUser.lastname)) {
				set(this, 'lastnameError', 'error');
				return $("#newUserLastname").focus();
			}
			if (isEmpty(this.newUser.email) || is.not.email(this.newUser.email)) {
				set(this, 'emailError', 'error');
				return $("#newUserEmail").focus();
			}

			let user = get(this, 'newUser');

			get(this, 'add')(user).then(() => {
				this.set('newUser', { firstname: "", lastname: "", email: "", active: true });
				$("#newUserFirstname").focus();
			});
		}
	}
});
