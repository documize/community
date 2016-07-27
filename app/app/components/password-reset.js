import Ember from 'ember';

const {
	isEmpty,
	isEqual,
	isPresent,
	computed,
	set

} = Ember;

export default Ember.Component.extend({
	password: "",
	passwordConfirm: "",
	mustMatch: false,
	passwordEmpty: computed('passwordError', {
		get() {
			let error = this.get('passwordError');
			if (isPresent(error)) {
				return `error`;
			}

			return;
		}
	}),
	confirmEmpty: computed('passwordConfirmError', {
		get() {
			let error = this.get('passwordConfirmError');
			if (isPresent(error)) {
				return `error`;
			}

			return;
		}
	}),

	actions: {
		reset() {
			let password = this.get('password');
			let passwordConfirm = this.get('passwordConfirm');

			if (isEmpty(password)) {
				set(this, 'passwordError', "error");
				return $("#newPassword").focus();
			}

			if (isEmpty(passwordConfirm)) {
				set(this, 'passwordConfirmError', "error");
				return $("#passwordConfirm").focus();
			}

			if (!isEqual(password, passwordConfirm)) {
				set(this, 'passwordError', "error");
				set(this, 'passwordConfirmError', "error");
				set(this, 'mustMatch', true);
				return;
			}

			this.get('reset')(password);
		}
	}
});
