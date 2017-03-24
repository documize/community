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


const {
	computed,
} = Ember;
export default Ember.Component.extend(NotifierMixin, {
	localStorage: Ember.inject.service(),
	appMeta: Ember.inject.service(),
	templateService: Ember.inject.service('template'),
	canEditTemplate: "",
	importedDocuments: [],
	savedTemplates: [],
	drop: null,
	newDocumentName: 'New Document',
	newDocumentNameMissing: computed.empty('newDocumentName'),

	init() {
		this._super(...arguments);

		this.get('templateService').getSavedTemplates().then((saved) => {
            let emptyTemplate = {
                id: "0",
                title: "Empty",
				description: "An empty canvas for your words",
				layout: "doc",
				locked: true
            };

            saved.unshiftObject(emptyTemplate);
            this.set('savedTemplates', saved);
        });
	},

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
		onHideDocumentWizard() {
			this.get('onHideDocumentWizard')();
		},

		editTemplate(template) {
			this.audit.record('edited-saved-template');
			this.get('router').transitionTo('document', this.get('folder.id'), this.get('folder.slug'), template.get('id'), template.get('slug'));

			return true;
		},

		startDocument(template) {
			this.audit.record('used-saved-template');
            this.send("showNotification", "Creating");

            this.get('templateService').importSavedTemplate(this.folder.get('id'), template.id).then((document) => {
				this.get('router').transitionTo('document', this.get('folder.id'), this.get('folder.slug'), document.get('id'), document.get('slug'));
            });

			return true;
		},

		onDocumentImporting(filename) {
			this.send("showNotification", `Importing ${filename}`);
			this.get('onHideDocumentWizard')();

			let documents = this.get('importedDocuments');
			documents.push(filename);
			this.set('importedDocuments', documents);
		},

		onDocumentImported(filename /*, document*/ ) {
			this.send("showNotification", `${filename} ready`);

			let documents = this.get('importedDocuments');
			documents.pop(filename);
			this.set('importedDocuments', documents);

			this.get('onImport')();

			if (documents.length === 0) {
				// this.get('showDocument')(this.get('folder'), document);
			}
		},
	}
});

