import Ember from 'ember';

const {
	computed,
	isEmpty,
	isEqual,
	isPresent
} = Ember;

export default Ember.Component.extend({
	password: { password: "", confirmation: "" },
	hasFirstnameError: computed('model.firstname', {
		get() {
			if (isEmpty(this.get('model.firstname'))) {
				return `error`;
			}

			return;
		}
	}),
	hasLastnameError: computed('model.lastname', {
		get() {
			if (isEmpty(this.get('model.lastname'))) {
				return `error`;
			}

			return;
		}
	}),
	hasEmailError: computed('model.email', {
		get() {
			if (isEmpty(this.get('model.email'))) {
				return `error`;
			}

			return;
		}
	}),
	hasPasswordError: computed('passwordError', 'password.password', {
		get() {
			if (isPresent(this.get('passwordError'))) {
				return `error`;
			}

			if (isEmpty(this.get('password.password'))) {
				return null;
			}
		}
	}),
	hasConfirmPasswordError: computed('confirmPasswordError', {
		get() {
			if (isPresent(this.get("confirmPasswordError"))) {
				return `error`;
			}

			return;
		}
	}),

	actions: {
		save() {
			let password = this.get('password.password');
			let confirmation = this.get('password.confirmation');

			if (isEmpty(this.model.get('firstname'))) {
				return $("#firstname").focus();
			}
			if (isEmpty(this.model.get('lastname'))) {
				return $("#lastname").focus();
			}
			if (isEmpty(this.model.get('email'))) {
				return $("#email").focus();
			}

			if (isPresent(password) && isEmpty(confirmation)) {
				Ember.set(this, 'confirmPasswordError', 'error');
				return $("#confirmPassword").focus();
			}
			if (isEmpty(password) && isPresent(confirmation)) {
				Ember.set(this, 'passwordError', 'error');
				return $("#password").focus();
			}
			if (!isEqual(password, confirmation)) {
				Ember.set(this, 'passwordError', 'error');
				return $("#password").focus();
			}

			let passwords = this.get('password');

			this.get('save')(passwords).finally(() => {
				Ember.set(this, 'password.password', '');
				Ember.set(this, 'password.confirmation', '');
			});
		}
	}
});
