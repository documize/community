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
	passwordEmpty: computed.empty('password'),
	confirmEmpty: computed.empty('passwordConfirm'),
	hasPasswordError: computed.and('passwordEmpty', 'passwordIsEmpty'),
	hasConfirmError: computed.and('confirmEmpty', 'passwordConfirmIsEmpty'),

	actions: {
		reset() {
			let password = this.get('password');
			let passwordConfirm = this.get('passwordConfirm');

			if (isEmpty(password)) {
				set(this, 'passwordIsEmpty', true);
				return $("#newPassword").focus();
			}

			if (isEmpty(passwordConfirm)) {
				set(this, 'passwordConfirmIsEmpty', true);
				return $("#passwordConfirm").focus();
			}

			if (!isEqual(password, passwordConfirm)) {
				set(this, 'hasPasswordError', true);
				set(this, 'hasConfirmError', true);
				set(this, 'mustMatch', true);
				return;
			}

			this.get('reset')(password).then(() => {
				set(this, 'passwordIsEmpty', false);
				set(this, 'passwordConfirmIsEmpty', false);
			});
		}
	}
});
