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
import netUtil from '../utils/net';
import config from '../config/environment';

const {
	inject: { service }
} = Ember;

export default Ember.Service.extend({
	session: service('session'),
	appMeta: service(),
	ready: false,
	enabled: config.APP.auditEnabled,
	appId: config.APP.intercomKey,

	init() {
		this.start();
	},

	record(id) {
		if (!this.get('enabled') || this.get('appId').length === 0) {
			return;
		}

		if (!this.get('ready')) {
			this.start();
		}

		Intercom('trackEvent', id); //jshint ignore: line
		Intercom('update'); //jshint ignore: line
	},

	stop() {
		if (!this.get('enabled') || this.get('appId').length === 0) {
			return;
		}

		Intercom('shutdown'); //jshint ignore: line
	},

	start() {
		let self = this;
		let user = this.get('session.user');

		if (is.undefined(user) || this.get('appId') === "" || !this.get('enabled') || !this.get('session.authenticated') || this.get('ready')) {
			return;
		}

		this.set('ready', true);

		window.intercomSettings = {
			app_id: this.get('appId'),
			name: user.fullname,
			email: user.email,
			user_id: user.id,
			"administrator": user.admin,
			company: {
				id: self.get('appMeta.orgId'),
				name: self.get('appMeta.title'),
				"domain": netUtil.getSubdomain(),
				"version": self.get('appMeta.version')
			}
		};

		if (!this.get('session.isMobile')) {
			window.intercomSettings.widget = {
				activator: "#IntercomDefaultWidget"
			};
		}

		window.Intercom('boot', window.intercomSettings);
	},
});
