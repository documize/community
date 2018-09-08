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
import netUtil from '../utils/net';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({
	ajax: service(),
	appMeta: service(),
	kcAuth: service(),
	localStorage: service(),

	restore(data) {
		// TODO: verify authentication data
		if (data) {
			return resolve(data);
		}

		return reject();
	},

	authenticate(data) {
		data.domain = netUtil.getSubdomain();

		if (!isPresent(data.token)) {
			return reject("data.token is empty");
		}
		if (!isPresent(data.email)) {
			return reject("data.email is empty");
		}

		return this.get('ajax').post('public/authenticate/keycloak', {
			data: JSON.stringify(data),
			contentType: 'json'
		});
	},

	invalidate() {
		this.get('localStorage').clearAll();
		return this.get('kcAuth').logout();
	}
});
