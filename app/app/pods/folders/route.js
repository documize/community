import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	folderService: Ember.inject.service('folder'),
	localStorage: Ember.inject.service(),
	folder: {},

	model: function () {
		return this.get('folderService').getAll();
	},

	afterModel: function (model) {
		// TODO: replace with ES6 features (remove self this)
		// TODO: replace is.* with Ember utilities
		// TODO: flatten if/else
		// TODO: make sure chain is maintained by returning promies

		if (is.empty(this.paramsFor('folders.folder'))) {
			let lastFolder = this.get('localStorage').getSessionItem("folder");

			//If folder lastFolder is defined
			if (Ember.isPresent(lastFolder)) {
				return this.get('folderService').getFolder(lastFolder).then((folder) => {
					//if Response is null or undefined redirect to login else transitionTo dashboard
					if (Ember.isNone(folder)) {
						this.transitionTo('auth.login');
					}
					this.folder = folder;
					this.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
				}).catch(() => {
					//if there was an error redirect to login
					this.transitionTo('auth.login');
				});
			}

			// If model has any folders redirect to dashboard
			if (model.length > 0) {
				let folder = model[0];
				this.folder = folder;
				this.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
			}

			// has no folders, create default folder
			return this.get('folderService').add({ name: "My Space" }).then((folder) => {
				this.folder = folder;
				this.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
			});
		}

		//If folder route has params
		if (Ember.isPresent(this.paramsFor('folders.folder'))) {

			let folderId = this.paramsFor('folders.folder').folder_id;

			return this.get('folderService').getFolder(folderId).then((folder) => {
				this.folder = folder;
			});
		}

		this.browser.setMetaDescription();
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set('folder', this.folder);
	}
});
