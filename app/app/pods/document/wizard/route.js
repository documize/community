import Ember from 'ember';

export default Ember.Route.extend({
    documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),
	sectionService: Ember.inject.service('section'),

	model() {
		let self = this;

		return Ember.RSVP.hash({
			folder: self.get('folderService').getFolder(self.paramsFor('document').folder_id),
			document: self.get('documentService').getDocument(self.paramsFor('document').document_id),
			sections: self.get('sectionService').getAll()
		});
	}
});
