import Ember from 'ember';

const {
	isEmpty,
	isEqual,

} = Ember;

export default Ember.Component.extend({
	password: "",
	passwordConfirm: "",
	mustMatch: false,
	passwordEmpty: computed('passwordError', {
		get() {
			if (this.get('passwordError')) {
				return `error`;
			}

			return;
		}
	}),
	confirmEmpty: computed('passwordConfirmError', {
		get() {
			if (this.get('passwordConfirmError')) {
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
				Ember.set(this, 'passwordError', true);
				return $("#newPassword").focus();
			}

			if (isEmpty(passwordConfirm)) {
				Ember.set(this, 'passwordConfirmError', true);
				return $("#passwordConfirm").focus();
			}

			if (!isEqual(password, passwordConfirm)) {
				$("#newPassword").addClass("error").focus();
				$("#passwordConfirm").addClass("error");
				this.set('mustMatch', true);
				return;
			}

			this.get('reset')();
		}
	}
});
