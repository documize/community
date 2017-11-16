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

import { registerAsyncHelper } from '@ember/test';

import Service, { inject as service } from '@ember/service';
// import netUtil from 'documize/utils/net';

const Audit = Service.extend({
	sessionService: service('session'),
	ready: false,
	enabled: true,

	init() {
		this.start();
	},

	record(id) {
		if (!this.get('enabled')) {
			return;
		}

		if (!this.get('ready')) {
			this.start();
		}

		return id;

	},

	stop() {},

	start() {
		let session = this.get('sessionService');

		if (!this.get('enabled') || !session.authenticated || this.get('ready')) {
			return;
		}

		this.set('ready', true);
	},
});

export default registerAsyncHelper('stubAudit', function (app, test, attrs = {}) {
	test.register('service:audit', Audit.extend(attrs));
});