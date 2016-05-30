import Ember from 'ember';
import miscUtil from 'documize/utils/misc';

const userNotification = Ember.Component.extend({
    notifications: [],

    didInsertElement() {
        // this.eventBus.subscribe('notifyUser', this, 'showNotification');
    },

    willDestroyElement() {
        // this.eventBus.unsubscribe('notifyUser');
    },

    showNotification(msg) {
        // console.log(msg);
    }
});


export default Ember.Test.registerAsyncHelper('stubUserNotification', function(app, test, attrs={}) {
    test.register('component:userNotification', userNotification.extend(attrs));
});
