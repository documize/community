import Ember from 'ember';
import models from '../utils/model';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),

    // Returns attributes for specified org id.
    getOrg(id) {
        let url = this.get('sessionService').appMeta.getUrl(`organizations/${id}`);

        return new Ember.RSVP.Promise(function(resolve, reject){
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response){
                    let org = models.OrganizationModel.create(response);
                    resolve(org);
                },
                error: function(reason){
                    reject(reason);
                }
            });
        });
    },

    // Updates an existing organization record.
    save(org) {
        let id = org.get('id');
        let url = this.get('sessionService').appMeta.getUrl(`organizations/${id}`);

        // refresh on-screen data
        this.get('sessionService').get('appMeta').setSafe('message', org.message);
        this.get('sessionService').get('appMeta').setSafe('title', org.title);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(org),
                contentType: 'json',
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
