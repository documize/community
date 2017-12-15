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

import { empty } from '@ember/object/computed';
import { schedule } from '@ember/runloop';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import NotifierMixin from '../../mixins/notifier';

export default Component.extend(NotifierMixin, {
	localStorage: service(),
	appMeta: service(),
	templateService: service('template'),
	importedDocuments: [],
	savedTemplates: [],
	importStatus: [],
	dropzone: null,
	newDocumentName: '',
	newDocumentNameMissing: empty('newDocumentName'),

	didReceiveAttrs() {
		this._super(...arguments);

		this.setupTemplates();

		schedule('afterRender', ()=> {
			this.setupImport();
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		if (is.not.null(this.get('dropzone'))) {
			this.get('dropzone').destroy();
			this.set('dropzone', null);
		}
	},

	setupTemplates() {
		let templates = this.get('templates');

		if (is.undefined(templates.findBy('id', '0'))) {
			let emptyTemplate = {
				id: "0",
				title: "Blank",
				description: "An empty canvas for your words",
				layout: "doc",
				locked: true
			};

			templates.unshiftObject(emptyTemplate);
		}

		this.set('savedTemplates', templates);

		schedule('afterRender', () => {
			$('#new-document-name').select();
		});
	},

	setupImport() {
		// already done init?
		if (is.not.null(this.get('dropzone'))) {
			this.get('dropzone').destroy();
			this.set('dropzone', null);
		}

		let self = this;
		let folderId = this.get('folder.id');
		let url = this.get('appMeta.endpoint');
		let importUrl = `${url}/import/folder/${folderId}`;

		let dzone = new Dropzone("#import-document-button", {
			headers: { 'Authorization': 'Bearer ' + self.get('session.session.content.authenticated.token') },
			url: importUrl,
			method: "post",
			paramName: 'attachment',
			acceptedFiles: ".doc,.docx,.md,.markdown,.htm,.html",
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
					console.log("Conversion failed for", x.name, x); // eslint-disable-line no-console
				});

				// this.on("queuecomplete", function () {});

				this.on("addedfile", function (file) {
					self.send('onDocumentImporting', file.name);
				});
			}
		});

		dzone.on("complete", function (file) {
			dzone.removeFile(file);
		});

		this.set('dropzone', dzone);
	},

	actions: {
		onHideStartDocument() {
			this.get('onHideStartDocument')();
		},

		editTemplate(template) {
			this.get('router').transitionTo('document', this.get('folder.id'), this.get('folder.slug'), template.get('id'), template.get('slug'));

			return true;
		},

		startDocument(template) {
			if (this.get('newDocumentNameMissing')) {
				this.$("#new-document-name").addClass('error').focus();
				return;
			}

			this.$("#new-document-name").removeClass('error');
			this.send("showNotification", "Creating");

            this.get('templateService').importSavedTemplate(this.folder.get('id'), template.id, this.get('newDocumentName')).then((document) => {
				this.get('router').transitionTo('document', this.get('folder.id'), this.get('folder.slug'), document.get('id'), document.get('slug'));
            });

			return true;
		},

		onDocumentImporting(filename) {
			let status = this.get('importStatus');
			let documents = this.get('importedDocuments');

			status.pushObject(`Converting ${filename}...`);
			documents.push(filename);

			this.set('importStatus', status);
			this.set('importedDocuments', documents);
		},

		onDocumentImported(filename /*, document*/ ) {
			let status = this.get('importStatus');
			let documents = this.get('importedDocuments');

			status.pushObject(`Successfully converted ${filename}`);
			documents.pop(filename);

			this.set('importStatus', status);
			this.set('importedDocuments', documents);

			if (documents.length === 0) {
				this.get('onHideStartDocument')();
				this.get('onImport')();
			}
		},
	}
});
