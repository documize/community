import Ember from 'ember';

const {
	isEmpty,
	computed,
	get,
	set
} = Ember;

export default Ember.Component.extend({
	titleEmpty: computed.empty('model.title'),
	messageEmpty: computed.empty('model.message'),
	hasTitleInputError: computed.and('titleEmpty', 'titleError'),
	hasMessageInputError: computed.and('messageEmpty', 'messageError'),

	actions: {
		save() {
			if (isEmpty(this.model.get('title'))) {
				set(this, 'titleError', true);
				return $("#siteTitle").focus();
			}

			if (isEmpty(this.model.get('message'))) {
				set(this, 'messageError', true);
				return $("#siteMessage").focus();
			}

			this.model.set('allowAnonymousAccess', Ember.$("#allowAnonymousAccess").prop('checked'));
			this.get('save')().then(() => {
				this.showNotification('Saved');
				set(this, 'titleError', false);
				set(this, 'messageError', false);
			});
		}
	}
});
