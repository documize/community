import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),

    actions: {
        refresh() {
            this.get('target.router').refresh();
        },

        onMoveDocument(documents, folder) {
            let self = this;
            documents.forEach(function(documentId) {
                self.get('documentService').getDocument(documentId).then(function(doc) {
                    doc.set('folderId', folder);
                    self.get('documentService').save(doc).then(function() {
                        self.get('target.router').refresh();
                    });
                });
            });
        },

        showDocument(folder, document) {
            this.transitionToRoute('document', folder.get('id'), folder.get('slug'), document.get('id'), document.get('slug'));
        },

		onFolderAdd(folder) {
			let self = this;
			this.showNotification("Added");

            this.get('folderService').add({ name: folder }).then(function(newFolder) {
                self.get('folderService').setCurrentFolder(newFolder);
                self.transitionToRoute('folders.folder', newFolder.get('id'), newFolder.get('slug'));
            });
        }
    }
});
