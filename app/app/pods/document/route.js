import Ember from 'ember';

export default Ember.Route.extend({
	documentService: Ember.inject.service('document'),

	model: function(params) {
        this.audit.record("viewed-document");
        return this.get('documentService').getDocument(params.document_id);
    },
});
