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
import { empty, and } from '@ember/object/computed';
import { set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import Component from '@ember/component';

export default Component.extend({
	email: "",
	sayThanks: false,
	sayError: false,
	emailEmpty: empty('email'),
	hasEmptyEmailError: and('emailEmpty', 'emailIsEmpty'),

	actions: {
		forgot() {
			let email = this.get('email');

			if (isEmpty(email)) {
				set(this, 'emailIsEmpty', true);
				return $("#email").focus();
			}

			set(this, 'sayThanks', false);
			set(this, 'sayError', false);

			set(this, 'emailIsEmpty', false);

			this.get('forgot')(email).then(() => {
				set(this, 'sayThanks', true);
				set(this, 'email', '');
			}).catch(() => {
				set(this, 'sayError', true);
			});
		}
	}
});
