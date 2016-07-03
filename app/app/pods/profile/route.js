import Ember from 'ember';

export default Ember.Route.extend({
    userService: Ember.inject.service('user'),
	folderService: Ember.inject.service('folder'),

    beforeModel: function() {
        if (!this.session.authenticated) {
            this.transitionTo('auth.login');
        }
    },

    model: function() {
        return this.get('userService').getUser(this.session.user.id);
    },

    afterModel: function(model) {
        this.browser.setTitleWithoutSuffix(model.get('fullname'));
    },

    setupController(controller, model) {
        controller.set('model', model);
		controller.set("folder", this.get('folderService.currentFolder'));
    }
});
