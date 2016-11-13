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
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
	appMeta: Ember.inject.service(),
	drop: null,
	deleteAttachment: {
		id: "",
		name: "",
	},
	emptyState: Ember.computed('files', function () {
		return this.get('files.length') === 0;
	}),

	didInsertElement() {
		if (!this.get('isEditor')) {
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
				this.on("success", function (file /*, response*/ ) {
					self.showNotification(`Attached ${file.name}`);
				});

				this.on("queuecomplete", function () {
					self.attrs.onUpload();
				});

				this.on("addedfile", function ( /*file*/ ) {
					self.audit.record('attached-file');
				});
			}
		});

		dzone.on("complete", function (file) {
			dzone.removeFile(file);
		});

		this.set('drop', dzone);
	},

	willDestroyElement() {
		let drop = this.get('drop');

		if (is.not.null(drop)) {
			drop.destroy();
		}
	},

	actions: {
		confirmDeleteAttachment(id, name) {
			this.set('deleteAttachment', {
				id: id,
				name: name
			});

			$(".delete-attachment-dialog").css("display", "block");

			let drop = new Drop({
				target: $(".delete-attachment-" + id)[0],
				content: $(".delete-attachment-dialog")[0],
				classes: 'drop-theme-basic',
				position: "bottom right",
				openOn: "always",
				tetherOptions: {
					offset: "5px 0",
					targetOffset: "10px 0"
				},
				remove: false
			});

			this.set('drop', drop);
		},

		cancel() {
			let drop = this.get('drop');
			drop.close();

			this.set('deleteAttachment', {
				id: "",
				name: ""
			});
		},

		deleteAttachment() {
			let attachment = this.get('deleteAttachment');
			let drop = this.get('drop');
			drop.close();

			this.attrs.onDelete(this.get('deleteAttachment').id, attachment.name);

			this.set('deleteAttachment', {
				id: "",
				name: ""
			});

			return true;
		}
	}
});
