import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';

const {
    RSVP: { resolve }
} = Ember;

export default Base.extend({
    restore(data) {
        return resolve(data);
    },
    authenticate(data) {
        return resolve(data);
    }
});
