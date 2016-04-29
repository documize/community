import Ember from 'ember';

export default Ember.Mixin.create({
	showNotification(msg) {
		this.eventBus.publish('notifyUser', msg);
	},

    actions: {
        showNotification(msg) {
            this.eventBus.publish('notifyUser', msg);
        }
    }
});
