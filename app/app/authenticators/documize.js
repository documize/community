import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
import encodingUtil from '../utils/encoding';
import netUtil from '../utils/net';

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

	authenticate(credentials) {
		let domain = netUtil.getSubdomain();

		let encoded;

		if (typeof credentials === 'object') {

			let { password, email } = credentials;

			if (!isPresent(password) || !isPresent(email)) {
				return Ember.RSVP.reject("invalid");
			}

			encoded = encodingUtil.Base64.encode(`${domain}:${email}:${password}`);
		} else if (typeof credentials === 'string') {
			encoded = credentials;
		} else {
			return Ember.RSVP.reject("invalid");

		}

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
