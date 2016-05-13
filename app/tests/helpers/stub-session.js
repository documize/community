import Ember from 'ember';

const Session = Ember.Service.extend({
    login(credentials) {
        // TODO: figure out what to do with credentials
        return new Ember.RSVP.resolve();
    }
});

export default Ember.Test.registerAsyncHelper('stubSession', function(app, test, attrs={}) {
    test.register('service:session', Session.extend(attrs));
});
