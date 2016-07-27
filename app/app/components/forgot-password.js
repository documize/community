import Ember from 'ember';

const {
	computed,
	isEmpty
} = Ember;

export default Ember.Component.extend({
	email: "",
	sayThanks: false,
	emptyEmail: computed('email', 'emptyEmailError', {
		get() {
			if (isEmpty(this.get('email')) && this.get('emptyEmailError')) {
				return `error`;
			}

			return;
		}
	}),

	actions: {
		forgot() {
			let email = this.get('email');

			if (isEmpty(email)) {
				Ember.set(this, 'emptyEmailError', true);
				return $("#email").focus();
			}

			this.get('forgot')(email).then(() => {
				Ember.set(this, 'sayThanks', true);
				Ember.set(this, 'email', '');
			}).catch((error) => {
				let message = error.message;
				console.log(message);
			});
		}
	}
});
