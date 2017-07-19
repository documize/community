import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),

	model() {
		return Ember.RSVP.hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			pages: this.modelFor('document').pages,
			diff: "",
			revisions: this.get('documentService').getDocumentRevisions(this.modelFor('document').document.get('id'))
		});
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set('hasRevisions', model.revisions.length > 0);
	}
});
