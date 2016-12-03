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

import Ember from 'ember';
import config from '../config/environment';

const {
	String: { htmlSafe },
	RSVP: { resolve },
	inject: { service }
} = Ember;

export default Ember.Service.extend({
	ajax: service(),
	localStorage: service(),

	endpoint: `${config.apiHost}/${config.apiNamespace}`,
	orgId: '',
	title: '',
	version: '',
	message: '',
	allowAnonymousAccess: false,
	setupMode: false,

	getBaseUrl(endpoint) {
		return [this.get('endpoint'), endpoint].join('/');
	},

	boot(requestedUrl) { // jshint ignore:line
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

		return this.get('ajax').request('public/meta').then((response) => {
			this.setProperties(response);
			return response;
		});
	}
});
