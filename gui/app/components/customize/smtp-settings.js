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

import $ from 'jquery';
import { empty } from '@ember/object/computed';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	SMTPHostEmptyError: empty('model.smtp.host'),
	SMTPPortEmptyError: empty('model.smtp.port'),
	SMTPSenderEmptyError: empty('model.smtp.sender'),
	senderNameError: empty('model.smtp.senderName'),

	buttonText: 'Save & Test',
	testSMTP: null,

	actions: {
		saveSMTP() {
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
			if (this.get('senderNameError')) {
				$("#smtp-senderName").focus();
				return;
			}

			this.set('testSMTP',  {
					success: true,
					message: ''
				},
			);

			this.showWait();
			this.set('buttonText', 'Please wait...');

			this.get('saveSMTP')().then((result) => {
				this.showDone();
				this.set('buttonText', 'Save & Test');
				this.set('testSMTP', result);
			});
		}
	}
});
