import Ember from 'ember';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),

    // getUsers returns all users for organization.
    find(keywords) {
        let url = this.get('sessionService').appMeta.getUrl("search?keywords=" + encodeURIComponent(keywords));

        return new Ember.RSVP.Promise(function(resolve, reject){
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason){
                    reject(reason);
                }
            });
        });
    },
});
