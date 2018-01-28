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

import { run } from '@ember/runloop';
import Component from '@ember/component';
import miscUtil from '../utils/misc';

export default Component.extend({
    init() {
        this._super(...arguments);
    },

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

        run(() => {
            self.$(elem).show();

            // FIXME: need a more robust solution
            miscUtil.interval(function() {
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