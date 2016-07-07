import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    documentService: Ember.inject.service('document'),
    folderService: Ember.inject.service('folder'),
    hasSelectedDocuments: false,
    selectedDocuments: [],

    actions: {
        refresh() {
            this.get('target.router').refresh();
        },

        onDocumentsChecked(documents) {
            this.set('selectedDocuments', documents);
            this.set('hasSelectedDocuments', documents.length > 0);
        },

        onMoveDocument(folder) {
            let self = this;
            let documents = this.get('selectedDocuments');

            documents.forEach(function (documentId) {
                self.get('documentService').getDocument(documentId).then(function (doc) {
                    doc.set('folderId', folder);
                    self.get('documentService').save(doc).then(function () {
                        self.get('target.router').refresh();
                    });
                });
            });

            this.set('selectedDocuments', []);
            this.set('hasSelectedDocuments', false);
            this.send("showNotification", "Moved");
        },

        onDeleteDocument() {
            let documents = this.get('selectedDocuments');
            let self = this;

            documents.forEach(function (document) {
                self.get('documentService').deleteDocument(document).then(function () {
                    self.get('target.router').refresh();
                });
            });

            this.set('selectedDocuments', []);
            this.set('hasSelectedDocuments', false);
            this.send("showNotification", "Deleted");
        },

        showDocument(folder, document) {
            this.transitionToRoute('document', folder.get('id'), folder.get('slug'), document.get('id'), document.get('slug'));
        },

        onFolderAdd(folder) {
            let self = this;
            this.showNotification("Added");

            this.get('folderService').add({ name: folder }).then(function (newFolder) {
                self.get('folderService').setCurrentFolder(newFolder);
                self.transitionToRoute('folders.folder', newFolder.get('id'), newFolder.get('slug'));
            });
        }
    }
});