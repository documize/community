import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	documentService: Ember.inject.service('document'),

	model: function(params) {
        this.audit.record("viewed-document");
        return this.get('documentService').getDocument(params.document_id);
    },
});
