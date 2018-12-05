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

import Mixin from '@ember/object/mixin';

export default Mixin.create({
	notifySuccess(msg) {
        this.eventBus.publish('notifyUser', msg, 'success');
	},

	notifyInfo(msg) {
        this.eventBus.publish('notifyUser', msg, 'info');
	},

	notifyWarn(msg) {
        this.eventBus.publish('notifyUser', msg, 'warn');
	},

	notifyError(msg) {
        this.eventBus.publish('notifyUser', msg, 'error');
	},

    actions: {
		notifySuccess(msg) {
			this.eventBus.publish('notifyUser', msg, 'success');
		},

		notifyInfo(msg) {
			this.eventBus.publish('notifyUser', msg, 'info');
		},

		notifyWarn(msg) {
			this.eventBus.publish('notifyUser', msg, 'warn');
		},

		notifyError(msg) {
			this.eventBus.publish('notifyUser', msg, 'error');
		}
    }
});
