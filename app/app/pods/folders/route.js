import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
    folderService: Ember.inject.service('folder'),
    folder: {},

    model: function() {
    	return this.get('folderService').getAll();
    },

    afterModel: function(model) {
        let self = this;

        if (is.empty(this.paramsFor('folders.folder'))) {
            var lastFolder = this.session.getSessionItem("folder");

            if (is.not.undefined(lastFolder)) {
                this.get('folderService').getFolder(lastFolder).then(function(folder) {
                    if (is.undefined(folder) || is.null(folder)) {
                        self.transitionTo('auth.login');
                    }
                    self.folder = folder;
                    self.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
                }, function() {
                    if (model.length > 0) {
                        var folder = model[0];
                        self.folder = folder;
                        self.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
                    } else {
                        self.transitionTo('auth.login');
                    }
                });
            } else {
                if (model.length > 0) {
                    var folder = model[0];
                    self.folder = folder;
                    self.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
                } else
				{
					// has no folders, create default folder
					this.get('folderService').add({ name: "My Space" }).then(function(folder) {
						self.folder = folder;
						self.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
		            });
				}
            }
        } else {
            var folderId = this.paramsFor('folders.folder').folder_id;
            this.get('folderService').getFolder(folderId).then(function(folder) {
                self.folder = folder;
            });
        }

        this.browser.setMetaDescription();
    },

    setupController(controller, model) {
        controller.set('model', model);
        controller.set('folder', this.folder);
    }
});
