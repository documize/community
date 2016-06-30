import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';

const {
    RSVP: { resolve }
} = Ember;

export default Base.extend({
    authenticate(data) {
        return resolve(data);
    }
});
