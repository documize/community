import Ember from 'ember';
import models from '../../../utils/model';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    documentService: Ember.inject.service('document'),

    actions: {
        onCancel() {
            this.transitionToRoute('document');
        },

        onAction(title, contentType) {
            this.audit.record("added-page");

            let self = this;

            let page = models.PageModel.create({
                documentId: this.get('model.document.id'),
                title: title,
                level: 2,
                sequence: 2048,
                body: "",
                contentType: contentType
            });

            let meta = models.PageMetaModel.create({
                documentId: this.get('model.document.id'),
                rawBody: "",
                config: ""
            });

            let model = {
                page: page,
                meta: meta
            };

            this.get('documentService').addPage(this.get('model.document.id'), model).then(function(newPage) {
                self.transitionToRoute('document.edit',
                    self.get('model.folder.id'),
                    self.get('model.folder.slug'),
                    self.get('model.document.id'),
                    self.get('model.document.slug'),
                    newPage.id);
            });
        }
    }
});