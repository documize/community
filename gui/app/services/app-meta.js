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

import { htmlSafe } from '@ember/string';

import { resolve } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import config from '../config/environment';
import constants from '../utils/constants';

export default Service.extend({
	ajax: service(),
	localStorage: service(),
	kcAuth: service(),
	apiHost: `${config.apiHost}`,
	endpoint: `${config.apiHost}/${config.apiNamespace}`,
	conversionEndpoint: '',
	orgId: '',
	title: '',
	version: '',
	message: '',
	edition: 'Community',
	valid: true,
	allowAnonymousAccess: false,
	authProvider: constants.AuthProvider.Documize,
	authConfig: null,
	setupMode: false,
	secureMode: false,

	invalidLicense() {
		return this.valid === false;
	},

	getBaseUrl(endpoint) {
		return [this.get('endpoint'), endpoint].join('/');
	},

	boot(requestedRoute, requestedUrl) { // eslint-disable-line no-unused-vars
		let dbhash;
		if (is.not.null(document.head.querySelector("[property=dbhash]"))) {
			dbhash = document.head.querySelector("[property=dbhash]").content;
		}

		let isInSetupMode = dbhash && dbhash !== "{{.DBhash}}";
		if (isInSetupMode) {
			this.setProperties({
				title: htmlSafe("Documize Setup"),
				allowAnonymousAccess: true,
				setupMode: true
			});

			this.get('localStorage').clearAll();

			return resolve(this);
		}

		if (requestedRoute === 'secure') {
			this.setProperties({
				title: htmlSafe("Secure document viewing"),
				allowAnonymousAccess: true,
				secureMode: true
			});

			this.get('localStorage').clearAll();

			return resolve(this);
		}

		return this.get('ajax').request('public/meta').then((response) => {
			this.setProperties(response);

			if (is.not.include(requestedUrl, '/auth/')) {
				this.get('localStorage').storeSessionItem('entryUrl', requestedUrl);
			}

			return response;
		});
	}
});
