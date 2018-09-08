// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import { isPresent } from '@ember/utils';
import { reject, resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import encodingUtil from '../utils/encoding';
import netUtil from '../utils/net';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({
	ajax: service(),
	appMeta: service(),
	localStorage: service(),

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
				return reject("invalid");
			}

			encoded = encodingUtil.Base64.encode(`${domain}:${email}:${password}`);
		} else if (typeof credentials === 'string') {
			encoded = credentials;
		} else {
			return reject("invalid");
		}

		let headers = { 'Authorization': 'Basic ' + encoded };

		return this.get('ajax').post('public/authenticate', { headers });
	},

	invalidate() {
		this.get('localStorage').clearAll();
		return resolve();
	}
});
