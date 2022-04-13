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

import $ from 'jquery';
import { A } from '@ember/array';
import { empty } from '@ember/object/computed';
import { computed, set } from '@ember/object';
import { isPresent, isEqual, isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import AuthProvider from '../../mixins/auth';
import stringUtil from '../../utils/string';
import Component from '@ember/component';

export default Component.extend(AuthProvider, {
	appMeta: service(),
	router: service(),
	hasFirstnameError: empty('model.firstname'),
	hasLastnameError: empty('model.lastname'),
	hasEmailError: computed('model.email', function() {
		let email = this.get('model.email');
		return isEmpty(email) || !stringUtil.isEmail(email);
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
				return `is-invalid`;
			}

			return '';
		}
	}),
	locale: { name: '' },
	locales: null,
	localChanged: false,

	init() {
		this._super(...arguments);
		this.password = { password: "", confirmation: "" };

		let l = this.get('appMeta.locales');
		let t = A([]);

		l.forEach((locale) => {
			t.pushObject( {name: locale} );
		});

		this.set('locales', t);
	},

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('locale', this.locales.findBy('name', this.get('model.locale')));
	},

	actions: {
		onSelectLocale(locale) {
			this.set('model.locale', locale.name);

			this.localChanged = true;
		},

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
				set(this, 'confirmPasswordError', 'error');
				return $("#confirmPassword").focus();
			}
			if (isEmpty(password) && isPresent(confirmation)) {
				set(this, 'passwordError', 'error');
				return $("#password").focus();
			}
			if (!isEqual(password, confirmation)) {
				set(this, 'passwordError', 'error');
				return $("#password").focus();
			}

			let passwords = this.get('password');

			this.get('save')(passwords).finally(() => {
				set(this, 'password.password', '');
				set(this, 'password.confirmation', '');

				if (this.localChanged) {
					this.get('router').transitionTo('auth.logout');
				}
			});
		}
	}
});
