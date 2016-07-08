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
    tagName: 'span',
    selectedTemplate: {
        id: "0"
    },
    canEditTemplate: "",
	drop: null,
    appMeta: Ember.inject.service(),

    didReceiveAttrs() {
        this.send('setTemplate', this.get('savedTemplates')[0]);
    },

	willDestroyElement() {
		if (is.not.null(this.get('drop'))) {
            this.get('drop').destroy();
            this.set('drop', null);
        }
	},

    actions: {
        setTemplate(chosen) {
            if (is.undefined(chosen)) {
                return;
            }

            this.set('selectedTemplate', chosen);
            this.set('canEditTemplate', chosen.id !== "0" ? "Edit" : "");

            let templates = this.get('savedTemplates');

            templates.forEach(template => {
                Ember.set(template, 'selected', template.id === chosen.id);
            });
        },

        editTemplate() {
            let template = this.get('selectedTemplate');

            this.audit.record('edited-saved-template');
            this.attrs.onEditTemplate(template);

            return true;
        },

        startDocument() {
            let template = this.get('selectedTemplate');

            this.audit.record('used-saved-template');
            this.attrs.onDocumentTemplate(template.id, template.title, "private");
            return true;
        },

        onOpenCallback() {
			if (is.not.null(this.get('drop'))) {
				return;
			}

			let self = this;
            let folderId = this.get('folder.id');
            let url = this.get('appMeta.url');
            let importUrl = `${url}/import/folder/${folderId}`;

			Dropzone.options.uploadDocuments = false;

            let dzone = new Dropzone("#upload-documents", {
                headers: {
                    'Authorization': 'Bearer ' + self.get('localStorage').getSessionItem('session.session.authenticated.token')
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

                init: function() {
                    this.on("success", function(document) {
                        self.attrs.onDocumentImported(document.name, document);
                    });

                    this.on("error", function(x) {
                        console.log("Conversion failed for ", x.name, " obj ", x); // TODO proper error handling
                    });

                    this.on("queuecomplete", function() {
					});

                    this.on("addedfile", function(file) {
                        self.attrs.onDocumentImporting(file.name);
                        self.audit.record('converted-document');
                    });
                }
            });

            dzone.on("complete", function(file) {
                dzone.removeFile(file);
            });

			this.set('drop', dzone);
        }
    }
});
