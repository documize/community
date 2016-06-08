import Ember from 'ember';

const userNotification = Ember.Component.extend({
    notifications: [],

    didInsertElement() {
        // this.eventBus.subscribe('notifyUser', this, 'notifyHandler');
    },

    willDestroyElement() {
        // this.eventBus.unsubscribe('notifyUser');
    },

    showNotification(msg) {
        // return msg;
    }
});


export default Ember.Test.registerAsyncHelper('stubUserNotification', function(app, test, attrs={}) {
    test.register('component:userNotification', userNotification.extend(attrs));
});
