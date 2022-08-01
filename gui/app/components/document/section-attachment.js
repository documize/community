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
import { computed } from '@ember/object';
import Modals from '../../mixins/modal';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Modals, Notifier, {
	appMeta: service(),
	session: service(),
	i18n: service(),
	editMode: false,
	downloadQuery: '',
	uploadId: computed('page', function () {
		let page = this.get('page');
		return `page-uploader-${page.id}`;
	}),
	uploadLabel: '',

	init(...args) {
		this._super(...args);

		this.uploadLabel = this.i18n.localize('upload_attachment');
	},

	didReceiveAttrs() {
		this._super(...arguments);

		// For authenticated users we send server auth token.
		let qry = '';
		if (this.get('session.hasSecureToken')) {
			qry = '?secure=' + this.get('session.secureToken');
		} else if (this.get('session.authenticated')) {
			qry = '?token=' + this.get('session.authToken');
		}
		this.set('downloadQuery', qry);
	},

	didRender() {
		this._super(...arguments);

		// For authenticated users we send server auth token.
		let qry = '';
		if (this.get('session.hasSecureToken')) {
			qry = '?secure=' + this.get('session.secureToken');
		} else if (this.get('session.authenticated')) {
			qry = '?token=' + this.get('session.authToken');
		}
		this.set('downloadQuery', qry);

		// We don't setup uploader if not edit mode.
		if (!this.get('editMode')) {
			return;
		}

		// Remove any previous Dropzone init.
		for (var j=0; j < 2; j++) {
			let dz = this.get('dzone' + j);

			if (!_.isNull(dz) && !_.isUndefined(dz)) {
				dz.destroy();
				this.set('dzone' + j, null);
			}
		}

		let self = this;
		let documentId = this.get('document.id');
		let pageId = this.get('page.id');
		let url = this.get('appMeta.endpoint');
		let uploadUrl = `${url}/documents/${documentId}/attachments?page=${pageId}`;
		let uploadId = this.get('uploadId');

		// Handle upload clicks on button and anything inside that button.
		let uploadSuccess = this.i18n.localize('uploaded');

		let sel = ['#' + uploadId, '#' + uploadId + ' > div'];
		for (var i=0; i < 2; i++) {
			let dzone = new Dropzone(sel[i], {
				headers: {
					'Authorization': 'Bearer ' + self.get('session.authToken')
				},
				url: uploadUrl,
				method: "post",
				paramName: 'attachment',
				clickable: true,
				maxFilesize: 250,
				parallelUploads: 5,
				uploadMultiple: false,
				addRemoveLinks: false,
				autoProcessQueue: true,

				init: function () {
					this.on("success", function (/*file, response*/ ) {
					});

					this.on("queuecomplete", () => {
						self.notifySuccess(uploadSuccess);
						self.get('onAttachmentUpload')();
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


			this.set('dzone' + i, dzone);
		}
	},

	actions: {
		onDelete(attachment) {
			this.notifySuccess(this.i18n.localize('deleted'));
			this.get('onAttachmentDelete')(attachment.id);
		}
	}
});
