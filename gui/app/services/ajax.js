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

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import config from '../config/environment';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
	session: service(),
	localStorage: service(),
	appMeta: service(),
	host: config.apiHost,
	namespace: config.apiNamespace,

	headers: computed('session.session.content.authenticated.token', {
		get() {
			let headers = {};
			const token = this.get('session.session.content.authenticated.token');
			if (token) {
				headers['authorization'] = token;
			}

			return headers;
		}
	}),

	handleResponse(status, headers /*, payload*/) {
		try {
			// Handle user permission changes.
			let user = this.get('session.session.content.authenticated.user');
			let userUpdate = headers['x-documize-status'];
			let appVersion = headers['x-documize-version'];

			// Unauthorized local API AJAX calls redirect to app root.
			if (status === 401 && !_.isUndefined(appVersion) && !_.includes(window.location.href, '/auth')) {
				this.get('localStorage').clearAll();
				window.location.href = 'auth/login';
			}

			// Handle billing/licensing issue.
			if (status === 402 || headers['x-documize-subscription'] === 'false') {
				this.set('appMeta.valid', false);
			}

			if (this.get('session.authenticated') && !_.isEmpty(userUpdate) && !_.isUndefined(userUpdate)) {
				let latest = JSON.parse(userUpdate);
				// Permission change means re-validation.
				if (!latest.active || user.editor !== latest.editor || user.admin !== latest.admin ||
					user.analytics !== latest.analytics || user.viewUsers !== latest.viewUsers) {
					this.get('localStorage').clearAll();
					window.location.href = 'auth/login';
				}
			}
		} catch(e) {
			console.log(e); // eslint-disable-line no-console
		} // eslint-disable-line no-empty

		return this._super(...arguments);
	}
});
