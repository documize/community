import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),
	sectionService: Ember.inject.service('section'),

	model() {
		let self = this;

		return Ember.RSVP.hash({
			folder: self.get('folderService').getFolder(self.paramsFor('document').folder_id),
			document: self.get('documentService').getDocument(self.paramsFor('document').document_id),
			sections: this.get('sectionService').getAll().then(function (sections) {
				return sections.filterBy('pageType', 'tab');
			})
		});
	}
});
