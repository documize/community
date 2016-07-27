import Ember from 'ember';

const {
	isEmpty,
	isPresent,
	computed,
	get,
	set
} = Ember;

export default Ember.Component.extend({
	titleInputError: computed('titleError', 'model.title', {
		get() {
			let error = get(this, 'titleError');
			let title = this.get('model.title');
			if (isPresent(error) || isEmpty(title)) {
				return `error`;
			}

			return;
		}
	}),
	messageInputError: computed('messageError', 'model.message', {
		get() {
			let error = get(this, 'messageError');
			let message = this.get('model.message');
			if (isPresent(error) || isEmpty(message)) {
				return `error`;
			}

			return;
		}
	}),

	actions: {
		save() {
			if (isEmpty(this.model.get('title'))) {
				set(this, 'titleError', 'error');
				return $("#siteTitle").focus();
			}

			if (isEmpty(this.model.get('message'))) {
				set(this, 'messageError', 'error');
				return $("#siteMessage").focus();
			}

			this.model.set('allowAnonymousAccess', Ember.$("#allowAnonymousAccess").prop('checked'));
			this.get('save')();
		}
	}
});
