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
			})
		}
	}
});
