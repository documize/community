import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
import encodingUtil from '../utils/encoding';
import netUtil from '../utils/net';
import models from '../utils/model';

const {
    isPresent,
    RSVP: { resolve, reject },
    inject: { service }
} = Ember;

export default Base.extend({

    ajax: service(),
    appMeta: service(),

    restore(data) {
        // TODO: verify authentication data
        if (data) {
            return resolve(data);
        }
        return reject();
    },

    authenticate({password, email}) {
        let domain = netUtil.getSubdomain();

        if (!isPresent(password) || !isPresent(email)) {
            return Ember.RSVP.reject("invalid");
        }

        var encoded = encodingUtil.Base64.encode(`${domain}:${email}:${password}`);

        var headers = {
            'Authorization': 'Basic ' + encoded
        };

        return this.get('ajax').post('public/authenticate', {
            headers
        });
    },

    invalidate() {
        return resolve();
    }
});
