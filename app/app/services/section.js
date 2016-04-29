import Ember from 'ember';
import models from '../utils/model';
import BaseService from '../services/base';

export default BaseService.extend({
    sessionService: Ember.inject.service('session'),

    // Returns all available sections.
    getAll() {
        let url = this.get('sessionService').appMeta.getUrl(`sections`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let data = [];
                    _.each(response, function(obj) {
                        data.pushObject(models.SectionModel.create(obj));
                    });
                    resolve(data);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Requests data from the specified section handler, passing the method and document ID
    // and POST payload.
    fetch(page, method, data) {
        let documentId = page.get('documentId');
        let section = page.get('contentType');
        let endpoint = `sections?documentID=${documentId}&section=${section}&method=${method}`;
        let url = this.get('sessionService').appMeta.getUrl(endpoint);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Did any dynamic sections change? Fetch and send up for rendering?
    refresh(documentId) {
        let url = this.get('sessionService').appMeta.getUrl(`sections/refresh?documentID=${documentId}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    // resolve(response);
                    let pages = [];

                    if (is.not.null(response) && is.array(response) && response.length > 0) {
                        _.each(response, function(page) {
                            pages.pushObject(models.PageModel.create(page));
                        });
                    }

                    resolve(pages);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    }
});