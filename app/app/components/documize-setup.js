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
	isEmpty,
	computed,
	set

} = Ember;

export default Ember.Component.extend({
	titleEmpty: computed.empty('model.title'),
	firstnameEmpty: computed.empty('model.firstname'),
	lastnameEmpty: computed.empty('model.lastname'),
	emailEmpty: computed.empty('model.email'),
	passwordEmpty: computed.empty('model.password'),
	hasEmptyTitleError: computed.and('titleEmpty', 'titleError'),
	hasEmptyFirstnameError: computed.and('firstnameEmpty', 'adminFirstnameError'),
	hasEmptyLastnameError: computed.and('lastnameEmpty', 'adminLastnameError'),
	hasEmptyEmailError: computed.and('emailEmpty', 'adminEmailError'),
	hasEmptyPasswordError: computed.and('passwordEmpty', 'adminPasswordError'),

	actions: {
		save() {
			if (isEmpty(this.get('model.title'))) {
				set(this, 'titleError', true);
				return $("#siteTitle").focus();
			}

			if (isEmpty(this.get('model.firstname'))) {
				set(this, 'adminFirstnameError', true);
				return $("#adminFirstname").focus();
			}

			if (isEmpty(this.get('model.lastname'))) {
				set(this, 'adminLastnameError', true);
				return $("#adminLastname").focus();
			}

			if (isEmpty(this.get('model.email')) || !is.email(this.get('model.email'))) {
				set(this, 'adminEmailError', true);
				return $("#adminEmail").focus();
			}

			if (isEmpty(this.get('model.password'))) {
				set(this, 'adminPasswordError', true);
				return $("#adminPassword").focus();
			}

			this.model.allowAnonymousAccess = Ember.$("#allowAnonymousAccess").prop('checked');

			this.get('save')().then(() => {
				set(this, 'titleError', false);
				set(this, 'adminFirstnameError', false);
				set(this, 'adminLastnameError', false);
				set(this, 'adminEmailError', false);
				set(this, 'adminPasswordError', false);
			});
		}
	}
});
