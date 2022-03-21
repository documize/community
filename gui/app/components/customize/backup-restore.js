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
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import Modal from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(Notifier, Modal, {
	appMeta: service(),
	router: service(),
	i18n: service(),

	browserSvc: service('browser'),
	backupLabel: '',
	backupSystemLabel: '',
    backupSpec: null,
    backupFilename: '',
    backupError: false,
	backupSuccess: false,
	backupRunning: false,
    restoreSpec: null,
	restoreButtonLabel: '',
	restoreUploadReady: false,
	confirmRestore: '',

    didReceiveAttrs() {
		this._super(...arguments);

        this.set('backupSpec', {
            retain: true,
            org: this.get('appMeta.orgId')
        });

        this.set('restoreSpec', {
            overwriteOrg: true,
            recreateUsers: true
		});

		this.set('restoreFile', null);
		this.set('confirmRestore', '');

		this.set('backupType', { Tenant: true, System: false });
	},

	didInsertElement() {
		this._super(...arguments);

		this.set('backupLabel', this.i18n.localize('backup'));
		this.set('backupSystemLabel', this.i18n.localize('backup_system'));
		this.set('restoreButtonLabel', this.i18n.localize('restore'))

		$('#restore-file').on('change', function(){
			var fileName = document.getElementById("restore-file").files[0].name;
			$(this).next('.custom-file-label').html(fileName);
		});
	},

	doBackup() {
		this.set('backupFilename', '');
		this.set('backupSuccess', false);
		this.set('backupFailed', false);
		this.set('backupRunning', true);

		let spec = this.get('backupSpec');

		this.get('onBackup')(spec).then((filename) => {
			this.notifySuccess(this.i18n.localize('completed'));
			this.set('backupLabel', this.i18n.localize('backup_start'));
			this.set('backupSuccess', true);
			this.set('backupFilename', filename);
			this.set('backupRunning', false);
		}, ()=> {
			this.notifyError(this.i18n.localize('backup_failed'));
			this.set('backupLabel', this.i18n.localize('backup_run'));
			this.set('backupFailed', true);
			this.set('backupRunning', false);
		});
	},

	actions: {
		onBackup() {
			// We perform tenant level backup.
			this.set('backupSpec.org', this.get('appMeta.orgId'));

			this.doBackup();
		},

		onSystemBackup() {
			// We perform system-level backup.
			this.set('backupSpec.org', '*');

			this.doBackup();
		},

		onShowRestoreModal() {
			this.modalOpen("#confirm-restore-modal", {"show": true}, '#confirm-restore');
		},

		onRestore(e) {
			e.preventDefault();

			let typed = this.get('confirmRestore');
			typed = typed.toLowerCase();

			if (typed !== 'restore' || typed === '') {
				$("#confirm-restore").addClass("is-invalid").focus();
				return;
			}

			this.set('confirmRestore', '');
			$("#confirm-restore").removeClass("is-invalid");

			this.modalClose('#confirm-restore-modal');

			// do we have upload file?
			// let files = document.getElementById("restore-file").files;
			// if (_.isUndefined(files) || _.isNull(files)) {
			// 	return;
			// }

			// let file = document.getElementById("restore-file").files[0];
			// if (_.isUndefined(file) || _.isNull(file)) {
			// 	return;
			// }

			let filedata = this.get('restoreFile');
			if (_.isNull(filedata)) {
				return;
			}

			// start restore process
			this.set('restoreButtonLabel', this.i18n.localize('restore_running'));
            this.set('restoreSuccess', false);
			this.set('restoreFailed', false);

			// If Documize Global Admin we perform system-level restore.
			// Otherwise it is current tenant backup.
			let spec = this.get('restoreSpec');
			if (this.get('session.isGlobalAdmin')) {
				spec.org = "*";
			}

			this.get('onRestore')(spec, filedata).then(() => {
				this.notifySuccess(this.i18n.localize('completed'));
				this.set('backupLabel', this.i18n.localize('restore'));
				this.set('restoreSuccess', true);
				this.get('router').transitionTo('auth.logout');
			}, ()=> {
				this.notifyError(this.i18n.localize('backup_failed'));
				this.set('restorbackupLabel', this.i18n.localize('restore'));
                this.set('restoreFailed', true);
			});
		},

		upload(event) {
			this.set('restoreUploadReady', false);
			this.set('restoreFile', null);

			// const reader = new FileReader();
			const file = event.target.files[0];

			this.set('restoreFile', file);
			this.set('restoreUploadReady', true);

			// let imageData;
			// reader.onload = () => {
			// 	imageData = reader.result;
			// 	this.set('restoreFile', imageData);
			// 	this.set('restoreUploadReady', true);
			// 	this.set('restoreUploading', false);
			// };

			// if (file) {
			// 	reader.readAsDataURL(file);
			// }
		}
	}
});

// {{#ui/ui-checkbox selected=restoreSpec.recreateUsers}}
// Recreate user accounts &mdash; users, groups, permissions
// {{/ui/ui-checkbox}}
