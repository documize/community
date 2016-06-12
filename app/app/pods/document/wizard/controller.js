import Ember from 'ember';
import models from '../../../utils/model';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    documentService: Ember.inject.service('document'),

    actions: {
        onCancel() {
            this.transitionToRoute('document');
        },

        onAddSection(section) {
			let self = this;

			this.audit.record("added-section");
            this.audit.record("added-section-" + section.contentType);

            let page = models.PageModel.create({
                documentId: this.get('model.document.id'),
                title: `${section.title} Section`,
                level: 2,
                sequence: 2048,
                body: "",
                contentType: section.contentType
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
