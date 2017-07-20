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
	isEmpty
} = Ember;

export default Ember.Component.extend({
	email: "",
	sayThanks: false,
	emailEmpty: computed.empty('email'),
	hasEmptyEmailError: computed.and('emailEmpty', 'emailIsEmpty'),

	actions: {
		forgot() {
			let email = this.get('email');

			if (isEmpty(email)) {
				Ember.set(this, 'emailIsEmpty', true);
				return $("#email").focus();
			}

			this.get('forgot')(email).then(() => {
				Ember.set(this, 'sayThanks', true);
				Ember.set(this, 'email', '');
				Ember.set(this, 'emailIsEmpty', false);
			});
		}
	}
});
