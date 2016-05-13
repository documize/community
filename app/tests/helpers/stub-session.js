import Ember from 'ember';
import Models from 'documize/utils/model';

const Session = Ember.Service.extend({
    appMeta: Ember.computed(function(){
        return Models.AppMeta.create();
    }),
    login(credentials) {
        // TODO: figure out what to do with credentials
        return new Ember.RSVP.resolve();
    },

    boot(){
        return new Ember.RSVP.resolve();
    },
    getSessionItem(key){
        return this.get(`data.${key}`);
    }
});

export default Ember.Test.registerAsyncHelper('stubSession', function(app, test, attrs={}) {
    test.register('service:session', Session.extend(attrs));
});
