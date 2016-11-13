import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),
	sectionService: Ember.inject.service('section'),

	model() {
		return Ember.RSVP.hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			pages: this.modelFor('document').pages,
			tabs: this.modelFor('document').tabs,
			sections: this.get('sectionService').getAll().then(function (sections) {
				return sections.filterBy('pageType', 'tab');
			})
		});
	}
});
