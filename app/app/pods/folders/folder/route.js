import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	documentService: Ember.inject.service('document'),
    folderService: Ember.inject.service('folder'),

    folder: {},

    model: function(params) {
		return Ember.RSVP.hash({
			folder: this.get('folderService').getFolder(params.folder_id),
			folders: this.get('folderService').getAll(),
			documents: this.get('documentService').getAllByFolder(params.folder_id)
		});
    },

    setupController: function(controller, model){
		controller.set('model', model);
        this.browser.setTitle(model.folder.get('name'));
        this.get('folderService').setCurrentFolder(model.folder);
    }
});
