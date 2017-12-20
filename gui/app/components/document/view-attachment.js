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
import Component from '@ember/component';

export default Component.extend({
	documentService: service('document'),
	appMeta: service(),
	hasAttachments: notEmpty('files'),
	deleteAttachment: {
		id: "",
		name: "",
	},
	canShow: computed('permissions', 'files', function() {
		return this.get('files.length') > 0 || this.get('permissions.documentEdit');
	}),
	showDialog: false,
	
	init() {
		this._super(...arguments);
		this.getAttachments();
	},

	didInsertElement() {
		this._super(...arguments);

		if (!this.get('permissions.documentEdit')) {
			return;
		}

		let self = this;
		let documentId = this.get('document.id');
		let url = this.get('appMeta.endpoint');
		let uploadUrl = `${url}/documents/${documentId}/attachments`;

		let dzone = new Dropzone("#upload-document-files", {
			headers: {
				'Authorization': 'Bearer ' + self.get('session.session.content.authenticated.token')
			},
			url: uploadUrl,
			method: "post",
			paramName: 'attachment',
			clickable: true,
			maxFilesize: 10,
			parallelUploads: 3,
			uploadMultiple: false,
			addRemoveLinks: false,
			autoProcessQueue: true,

			init: function () {
				this.on("success", function (/*file, response*/ ) {
				});

				this.on("queuecomplete", function () {
					self.getAttachments();
				});

				this.on("addedfile", function ( /*file*/ ) {
				});
			}
		});

		dzone.on("complete", function (file) {
			dzone.removeFile(file);
		});

		this.set('drop', dzone);
	},

	willDestroyElement() {
		this._super(...arguments);
	},

	getAttachments() {
		this.get('documentService').getAttachments(this.get('document.id')).then((files) => {
			this.set('files', files);
		});
	},

	actions: {
		onShowDialog(id, name) {
			this.set('deleteAttachment', { id: id, name: name });

			this.set('showDialog', true);
		},

		onDelete() {
			this.set('showDialog', false);

			let attachment = this.get('deleteAttachment');
			
			this.get('documentService').deleteAttachment(this.get('document.id'), attachment.id).then(() => {
				this.getAttachments();
				this.set('deleteAttachment', {
					id: "",
					name: ""
				});
			});

			return true;
		}
	}
});
