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
    userService: Ember.inject.service('user'),
    drop: null,
    users: [],
    saveTemplate: {
        name: "",
        description: ""
    },

    didRender() {
        if (this.get('isEditor')) {
            this.addTooltip(document.getElementById("attachment-button"));
            this.addTooltip(document.getElementById("save-template-button"));
            this.addTooltip(document.getElementById("set-meta-button"));
        }

        if (this.session.authenticated) {
            this.addTooltip(document.getElementById("owner-avatar"));
        }
    },

    didInsertElement() {
        if (this.get('isEditor')) {
            let self = this;
            let documentId = this.get('document.id');
            let uploadUrl = this.session.appMeta.getUrl(`documents/${documentId}/attachments`);

            let dzone = new Dropzone("#attachment-button > i", {
                headers: {
                    'Authorization': 'Bearer ' + self.session.getSessionItem('token')
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

                init: function() {
                    this.on("success", function(file /*, response*/ ) {
                        self.showNotification(`Attached ${file.name}`);
                    });

                    this.on("queuecomplete", function() {
                        self.attrs.onAttachmentUpload();
                    });

                    this.on("addedfile", function( /*file*/ ) {
                        self.audit.record('attached-file');
                    });
                }
            });

            dzone.on("complete", function(file) {
                dzone.removeFile(file);
            });

            this.set('drop', dzone);
        }
    },

    willDestroyElement() {
        if (is.not.null(this.get('drop'))) {
            this.get('drop').destroy();
            this.set('drop', null);
        }

        this.destroyTooltips();
    },

    actions: {
		deleteDocument() {
			this.attrs.onDocumentDelete();
        },

        saveTemplate() {
            var templateName = this.get('saveTemplate.name');
            var templateDescription = this.get('saveTemplate.description');

            if (is.empty(templateName)) {
                $("#new-template-name").addClass("error").focus();
                return false;
            }

            if (is.empty(templateDescription)) {
                $("#new-template-desc").addClass("error").focus();
                return false;
            }


            let doc = this.get('document');
            doc.set('template', true);
            doc.set('name', templateName);
            doc.set('excerpt', templateDescription);

            this.set('saveTemplate.name', "");
            this.set('saveTemplate.description', "");

            this.showNotification('Templated');
            this.attrs.onSaveTemplate(doc);

            return true;
        },

        saveMeta() {
            let doc = this.get('document');

            if (is.empty(doc.get('excerpt'))) {
                $("meta-excerpt").addClass("error").focus();
                return false;
            }

            doc.set('excerpt', doc.get('excerpt').substring(0, 250));
            doc.set('userId', this.get('owner.id'));
            this.showNotification("Saved");

            this.attrs.onDocumentChange(doc);
            return true;
        },

        // close dialog
        close() {
            return true;
        },
    }
});
