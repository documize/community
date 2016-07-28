import Ember from 'ember';

const {
	isEmpty,
	isEqual,
	isPresent,
	computed,
	set

} = Ember;

export default Ember.Component.extend({
	titleEmpty: computed.empty('model.title'),
	firstnameEmpty: computed.empty('model.firstname'),
	lastnameEmpty: computed.empty('model.lastname'),
	emailEmpty: computed.empty('model.email'),
	passwordEmpty: computed.empty('model.password'),
	hasPasswordError: computed.and('titleEmpty', 'titleError'),
	hasConfirmError: computed.and('firstnameEmpty', 'adminFirstnameError'),
	hasPasswordError: computed.and('lastnameEmpty', 'adminLastnameError'),
	hasConfirmError: computed.and('emailEmpty', 'adminEmailError'),
	hasPasswordError: computed.and('passwordEmpty', 'adminPasswordError'),

	actions: {
		save() {
			if (isEmpty(this.model.title)) {
				set(this, 'titleError', true);
				return $("#siteTitle").focus();
			}

			if (isEmpty(this.model.firstname)) {
				set(this, 'adminFirstnameError', true);
				return $("#adminFirstname").focus();
			}

			if (isEmpty(this.model.lastname)) {
				set(this, 'adminLastnameError', true);
				return $("#adminLastname").focus();
			}

			if (isEmpty(this.model.email) || !is.email(this.model.email)) {
				set(this, 'adminEmailError', true);
				return $("#adminEmail").focus();
			}

			if (isEmpty(this.model.password)) {
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
