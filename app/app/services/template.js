import Ember from 'ember';
import models from '../utils/model';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),

    importStockTemplate: function(folderId, templateId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("templates/" + templateId + "/folder/" + folderId + "?type=stock"),
                type: 'POST',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    importSavedTemplate: function(folderId, templateId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("templates/" + templateId + "/folder/" + folderId + "?type=saved"),
                type: 'POST',
                success: function(doc) {
					let docModel = models.DocumentModel.create(doc);
                    resolve(docModel);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    getSavedTemplates() {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject){
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("templates"),
                type: 'GET',
                success: function(response) {
					if (is.not.array(response)) {
						response = [];
					}
					let templates = Ember.ArrayProxy.create({ content: Ember.A([]) });

                    _.each(response, function(template) {
                        let templateModel = models.TemplateModel.create(template);
                        templates.pushObject(templateModel);
                    });

                    resolve(templates);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    getStockTemplates() {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject){
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("templates/stock"),
                type: 'GET',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    }
});
