import Ember from 'ember';

export default Ember.Route.extend({
    documentService: Ember.inject.service('document'),
    folderService: Ember.inject.service('folder'),

    model(params) {
        let self = this;

        this.audit.record("edited-page");

        return Ember.RSVP.hash({
            folder: self.get('folderService').getFolder(self.paramsFor('document').folder_id),
            document: self.modelFor('document'),
            page: self.get('documentService').getPage(self.paramsFor('document').document_id, params.page_id),
            meta: self.get('documentService').getPageMeta(self.paramsFor('document').document_id, params.page_id)
        });
    }
});