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

const {
    computed
} = Ember;

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
	folderService: Ember.inject.service('folder'),
    documentService: Ember.inject.service('document'),
    session: Ember.inject.service(),
	appMeta: Ember.inject.service(),

	showToolbar: false,
    folder: {},
    busy: false,
    importedDocuments: [],
    isFolderOwner: computed.equal('folder.userId', 'session.user.id'),
    moveFolderId: "",
	drop: null,

    didReceiveAttrs() {
        this.set('isFolderOwner', this.get('folder.userId') === this.get("session.user.id"));

		let show = this.get('isFolderOwner') || this.get('hasSelectedDocuments') || this.get('folderService').get('canEditCurrentFolder');
		this.set('showToolbar', show);

        let targets = _.reject(this.get('folders'), {
            id: this.get('folder').get('id')
        });

        this.set('movedFolderOptions', targets);
    },

    didRender() {
        if (this.get('hasSelectedDocuments')) {
            this.addTooltip(document.getElementById("move-documents-button"));
            this.addTooltip(document.getElementById("delete-documents-button"));
        } else {
            if (this.get('isFolderOwner')) {
                this.addTooltip(document.getElementById("folder-share-button"));
                this.addTooltip(document.getElementById("folder-settings-button"));
            }
            if (this.get('folderService').get('canEditCurrentFolder')) {
				this.addTooltip(document.getElementById("import-document-button"));
            }
        }
    
        if (this.get('folderService').get('canEditCurrentFolder')) {
			let self = this;
			let folderId = this.get('folder.id');
			let url = this.get('appMeta.endpoint');
			let importUrl = `${url}/import/folder/${folderId}`;

			let dzone = new Dropzone("#import-document-button > i", {
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
						console.log("Conversion failed for ", x.name, " obj ", x); // TODO proper error handling
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

            this.attrs.refresh();

            if (documents.length === 0) {
                // this.get('showDocument')(this.get('folder'), document);
            }
        },

        deleteDocuments() {
			this.attrs.onDeleteDocument();
        },

        setMoveFolder(folderId) {
            this.set('moveFolderId', folderId);

            let folders = this.get('folders');

            folders.forEach(folder => {
                folder.set('selected', folder.id === folderId);
            });
        },

        moveDocuments() {
            if (this.get("moveFolderId") === "") {
                return false;
            }

            this.attrs.onMoveDocument(this.get('moveFolderId'));
            this.set("moveFolderId", "");

            return true;
        }
    }
});
