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
    backupSpec: null,
    backupFilename: '',
    backupError: false,
    backupSuccess: false,

    didReceiveAttrs() {
        this._super(...arguments);
        this.set('backupSpec', {
            retain: true,
            org: '*'
            // org: this.get('appMeta.orgId')
        });
    },

	actions: {
		onBackup() {
			this.showWait();
			this.set('buttonLabel', 'Please wait, backup running...');
            this.set('backupFilename', '');
            this.set('backupSuccess', false);
            this.set('backupFailed', false);

			this.get('onBackup')(this.get('backupSpec')).then((filename) => {
				this.set('buttonLabel', 'Run Backup');
				this.showDone();
                this.set('backupSuccess', true);
                this.set('backupFilename', filename);
			}, ()=> {
				this.set('buttonLabel', 'Run Backup');
                this.set('backupFailed', true);
			});
		}
	}
});
