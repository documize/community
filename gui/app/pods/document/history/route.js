import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	documentService: service('document'),
	folderService: service('folder'),

	model() {
		return hash({
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
