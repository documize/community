import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    documentService: Ember.inject.service('document'),

    actions: {
        onCancel( /*page*/ ) {
            this.transitionToRoute('document', {
                queryParams: {
                    page: this.get('model.page.id')
                }
            });
        },

        onAction(page, meta) {
            let self = this;
            this.showNotification("Saving");

            let model = {
                page: page,
                meta: meta
            };

            this.get('documentService').updatePage(page.get('documentId'), page.get('id'), model).then(function() {
                self.audit.record("edited-page");
                self.transitionToRoute('document', {
                    queryParams: {
                        page: page.get('id')
                    }
                });
            });
        }
    }
});