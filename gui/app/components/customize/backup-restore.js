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

import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	browserSvc: service('browser'),
	buttonLabel: 'Run Backup',

	actions: {
		onBackup() {
			this.showWait();
			this.set('buttonLabel', 'Please wait, backup running...');

			this.get('onBackup')({}).then(() => {
				this.set('buttonLabel', 'Run Backup');
				this.showDone();
			});
		}
	}
});
