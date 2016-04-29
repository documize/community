import Ember from 'ember';

export default Ember.Route.extend({
    model: function(params) {
        this.set('folderId', params.id);
        this.set('slug', params.slug);
        this.set('serial', params.serial);
    },

    setupController(controller, model) {
        controller.set('model', model);
        controller.set('serial', this.serial);
        controller.set('slug', this.slug);
        controller.set('folderId', this.folderId);
    }
});
