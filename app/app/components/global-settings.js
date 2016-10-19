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

import Ember from 'ember';

const {
	computed
} = Ember;

export default Ember.Component.extend({
	SMTPHostEmptyError: computed.empty('model.global.host'),
	SMTPPortEmptyError: computed.empty('model.global.port'),
	SMTPSenderEmptyError: computed.empty('model.global.sender'),
	SMTPUserIdEmptyError: computed.empty('model.global.userid'),
	SMTPPasswordEmptyError: computed.empty('model.global.password'),

	actions: {
		save() {
			if (this.get('SMTPHostEmptyError')) {
				$("#smtp-host").focus();
				return;
			}
			if (this.get('SMTPPortEmptyError')) {
				$("#smtp-port").focus();
				return;
			}
			if (this.get('SMTPSenderEmptyError')) {
				$("#smtp-sender").focus();
				return;
			}
			if (this.get('SMTPUserIdEmptyError')) {
				$("#smtp-userid").focus();
				return;
			}
			if (this.get('SMTPPasswordEmptyError')) {
				$("#smtp-password").focus();
				return;
			}

			this.get('save')().then(() => {
			});
		}
	}
});
