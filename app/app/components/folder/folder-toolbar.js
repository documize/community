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
    documentService: Ember.inject.service('document'),
    templateService: Ember.inject.service('template'),
    folderService: Ember.inject.service('folder'),

    folder: {},
    busy: false,
    importedDocuments: [],
    savedTemplates: [],
    isFolderOwner: false,
    moveFolderId: "",

    didReceiveAttrs() {
        this.set('isFolderOwner', this.get('folder.userId') === this.session.user.id);

        let self = this;

        this.get('templateService').getSavedTemplates().then(function(saved) {
            let emptyTemplate = {
                id: "0",
                title: "Empty document",
                selected: true
            };
            saved.unshiftObject(emptyTemplate);
            self.set('savedTemplates', saved);
        });

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
                this.addTooltip(document.getElementById("start-document-button"));
            }
        }
    },

    willDestroyElement() {
        this.destroyTooltips();
    },

    navigateToDocument(document) {
        this.attrs.showDocument(this.get('folder'), document);
    },

    actions: {
        onEditTemplate(template) {
            this.navigateToDocument(template);
        },

        onDocumentTemplate(id /*, title, type*/ ) {
            let self = this;

            this.send("showNotification", "Creating");

            this.get('templateService').importSavedTemplate(this.folder.get('id'), id).then(function(document) {
                self.navigateToDocument(document);
            });
        },

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
