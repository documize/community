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

import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Modals from '../../mixins/modal';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Modals, Notifier, {
	classNames: ["section"],
	documentService: service('document'),
	browserSvc: service('browser'),
	appMeta: service(),
	session: service(),
	hasAttachments: notEmpty('files'),
	canEdit: computed('permissions.documentEdit', 'document.protection', function() {
		return this.get('document.protection') !== this.get('constants').ProtectionType.Lock && this.get('permissions.documentEdit');
	}),
	showDialog: false,
	downloadQuery: '',

	didReceiveAttrs() {
		this._super(...arguments);
		this.getAttachments();
	},

	didInsertElement() {
		this._super(...arguments);

		if (!this.get('permissions.documentEdit') || this.get('document.protection') === this.get('constants').ProtectionType.Lock) {
			return;
		}

		let self = this;
		let documentId = this.get('document.id');
		let url = this.get('appMeta.endpoint');
		let uploadUrl = `${url}/documents/${documentId}/attachments`;

		let dzone = new Dropzone("#upload-document-files > div", {
			headers: {
				'Authorization': 'Bearer ' + self.get('session.authToken')
			},
			url: uploadUrl,
			method: "post",
			paramName: 'attachment',
			clickable: true,
			maxFilesize: 50,
			parallelUploads: 5,
			uploadMultiple: false,
			addRemoveLinks: false,
			autoProcessQueue: true,

			init: function () {
				this.on("success", function (/*file, response*/ ) {
				});

				this.on("queuecomplete", function () {
					self.notifySuccess('Uploaded file');
					self.getAttachments();
				});

				this.on("addedfile", function ( /*file*/ ) {
				});

				this.on("error", function (error, msg) {
					self.notifyError(msg);
					self.notifyError(error);
				});
			}
		});

		dzone.on("complete", function (file) {
			dzone.removeFile(file);
		});

		this.set('drop', dzone);

		// For authenticated users we send server auth token.
		let qry = '';
		if (this.get('session.authenticated')) {
			qry = '?token=' + this.get('session.authToken');
		} else {
			qry = '?secure=' + this.get('session.secureToken');
		}
		this.set('downloadQuery', qry);
	},

	getAttachments() {
		this.get('documentService').getAttachments(this.get('document.id')).then((files) => {
			this.set('files', files);
		});
	},

	actions: {
		onDelete(attachment) {
			this.get('documentService').deleteAttachment(this.get('document.id'), attachment.id).then(() => {
				this.notifySuccess('File deleted');
				this.getAttachments();
			});
		},

		onExport() {
			this.get('documentSvc').export({}).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, this.get('space.slug') + '.html');
				this.notifySuccess('Exported');
			});

			this.modalClose("#space-export-modal");
		}
	}
});
