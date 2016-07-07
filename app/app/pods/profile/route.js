import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	userService: Ember.inject.service('user'),
	folderService: Ember.inject.service('folder'),
	session: Ember.inject.service(),

	beforeModel: function () {
		if (!this.get("session.authenticated")) {
			this.transitionTo('auth.login');
		}
	},

	model: function () {
		return this.get('userService').getUser(this.get("session.session.authenticated.user.id"));
	},

	afterModel: function (model) {
		this.browser.setTitleWithoutSuffix(model.get('fullname'));
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set("folder", this.get('folderService.currentFolder'));
	}
});