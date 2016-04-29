import Ember from 'ember';
import miscUtil from '../utils/misc';

export default Ember.Component.extend({
    notifications: [],

    didInsertElement() {
        this.eventBus.subscribe('notifyUser', this, 'showNotification');
    },

    willDestroyElement() {
        this.eventBus.unsubscribe('notifyUser');
    },

    showNotification(msg) {
        let self = this;
        let notifications = this.get('notifications');
        notifications.pushObject(msg);
        this.set('notifications', notifications);

        let elem = this.$(".user-notification")[0];

        Ember.run(() => {
            self.$(elem).show();

            // FIXME: need a more robust solution
            miscUtil.interval(function(){
                let notifications = self.get('notifications');

                if (notifications.length > 0) {
                    notifications.removeAt(0);
                    self.set('notifications', notifications);
                }

                if (notifications.length === 0) {
                    self.$(elem).hide();
                }
            }, 2500, self.get('notifications').length);
        });
    },
});
