// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import Ember from 'ember';

const {
	computed,
	isEmpty,
	isEqual,
	isPresent
} = Ember;

export default Ember.Component.extend({
	password: { password: "", confirmation: "" },
	hasFirstnameError: computed.empty('model.firstname'),
	hasLastnameError: computed.empty('model.lastname'),
	hasEmailError: computed.empty('model.email'),
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

			if (isEmpty(this.get('model.firstname'))) {
				return $("#firstname").focus();
			}
			if (isEmpty(this.get('model.lastname'))) {
				return $("#lastname").focus();
			}
			if (isEmpty(this.get('model.email'))) {
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
