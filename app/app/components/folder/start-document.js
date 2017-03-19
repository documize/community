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

export default Ember.Component.extend(NotifierMixin, {
	localStorage: Ember.inject.service(),
	appMeta: Ember.inject.service(),

	canEditTemplate: "",
	importedDocuments: [],
	drop: null,

	didInsertElement() {
		this.setupImport();
	},

	willDestroyElement() {
		if (is.not.null(this.get('drop'))) {
			this.get('drop').destroy();
			this.set('drop', null);
		}
	},

	setupImport() {
		// already done init?
		if (is.not.null(this.get('drop'))) {
			this.get('drop').destroy();
			this.set('drop', null);
		}

		let self = this;
		let folderId = this.get('folder.id');
		let url = this.get('appMeta.endpoint');
		let importUrl = `${url}/import/folder/${folderId}`;

		let dzone = new Dropzone("#import-document-button", {
			headers: {
				'Authorization': 'Bearer ' + self.get('session.session.content.authenticated.token')
			},
			url: importUrl,
			method: "post",
			paramName: 'attachment',
			acceptedFiles: ".doc,.docx,.txt,.md,.markdown",
			clickable: true,
			maxFilesize: 10,
			parallelUploads: 3,
			uploadMultiple: false,
			addRemoveLinks: false,
			autoProcessQueue: true,

			init: function () {
				this.on("success", function (document) {
					self.send('onDocumentImported', document.name, document);
				});

				this.on("error", function (x) {
					console.log("Conversion failed for ", x.name, " obj ", x); // eslint-disable-line no-console
				});

				this.on("queuecomplete", function () {});

				this.on("addedfile", function (file) {
					self.send('onDocumentImporting', file.name);
					self.audit.record('converted-document');
				});
			}
		});

		dzone.on("complete", function (file) {
			dzone.removeFile(file);
		});

		this.set('drop', dzone);
	},

	actions: {
		onDocumentImporting(filename) {
			this.send("showNotification", `Importing ${filename}`);

			let documents = this.get('importedDocuments');
			documents.push(filename);
			this.set('importedDocuments', documents);
		},

		onDocumentImported(filename /*, document*/ ) {
			this.send("showNotification", `${filename} ready`);

			let documents = this.get('importedDocuments');
			documents.pop(filename);
			this.set('importedDocuments', documents);

			this.attrs.onImport();

			if (documents.length === 0) {
				// this.get('showDocument')(this.get('folder'), document);
			}
		},

		editTemplate(template) {
			this.audit.record('edited-saved-template');
			this.attrs.onEditTemplate(template);

			return true;
		},

		startDocument(template) {
			this.audit.record('used-saved-template');
			this.attrs.onDocumentTemplate(template.id, template.title, "private");

			return true;
		}
	}
});
