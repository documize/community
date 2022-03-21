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
	classNames: ["document-meta", ' non-printable'],
	documentService: service('document'),
	browserSvc: service('browser'),
	appMeta: service(),
	session: service(),
	i18n: service(),
	hasAttachments: notEmpty('files'),
	canEdit: computed('permissions.{documentApprove,documentEdit}', 'document.protection', function() {
		// Check to see if specific scenarios prevent us from changing doc level attachments.
		if (this.get('document.protection') === this.get('constants').ProtectionType.Lock) return false;
		if (!this.get('permissions.documentEdit')) return false;
		if (this.get('document.protection') === this.get('constants').ProtectionType.Review && !this.get('permissions.documentApprove')) return false;

		// By default, we can edit/upload attachments that sit at the document level.
		return true;
	}),
	showDialog: false,
	downloadQuery: '',

	didReceiveAttrs() {
		this._super(...arguments);
		this.getAttachments();
	},

	didInsertElement() {
		this._super(...arguments);

		// For authenticated users we send server auth token.
		let qry = '';
		if (this.get('session.hasSecureToken')) {
			qry = '?secure=' + this.get('session.secureToken');
		} else if (this.get('session.authenticated')) {
			qry = '?token=' + this.get('session.authToken');
		}
		this.set('downloadQuery', qry);

		if (!this.get('permissions.documentEdit') || this.get('document.protection') === this.get('constants').ProtectionType.Lock) {
			return;
		}

		let self = this;
		let documentId = this.get('document.id');
		let url = this.get('appMeta.endpoint');
		let uploadUrl = `${url}/documents/${documentId}/attachments`;

		// Handle upload clicks on button and anything inside that button.
		// But only if user can edit this document.
		if (!this.get('canEdit')) return;
		let uploaded = this.i18n.localize('uploaded');

		let sel = ['#upload-document-files ', '#upload-document-files  > i'];
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

					this.on("queuecomplete", function () {
						self.notifySuccess(uploaded);
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
		}
	},

	getAttachments() {
		this.get('documentService').getAttachments(this.get('document.id')).then((files) => {
			this.set('files', files);
		});
	},

	actions: {
		onDelete(attachment) {
			this.get('documentService').deleteAttachment(this.get('document.id'), attachment.id).then(() => {
				this.notifySuccess(this.i18n.localize('deleted'));
				this.getAttachments();
			});
		}
	}
});
