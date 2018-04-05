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
import AjaxService from 'ember-ajax/services/ajax';
import config from '../config/environment';

export default AjaxService.extend({
	session: service(),
	localStorage: service(),
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
			let user = this.get('session.session.content.authenticated.user');
			let userUpdate = headers['x-documize-status'];
			let appVersion = headers['x-documize-version'];

			// when unauthorized on local API AJAX calls, redirect to app root
			if (status === 401 && is.not.undefined(appVersion) && is.not.includes(window.location.href, '/auth')) {
				this.get('localStorage').clearAll();
				window.location.href = 'auth/login';
			}

			if (is.not.empty(userUpdate)) {
				let latest = JSON.parse(userUpdate);

				if (!latest.active || user.editor !== latest.editor || user.admin !== latest.admin || user.analytics !== latest.analytics || user.viewUsers !== latest.viewUsers) {
					this.get('localStorage').clearAll();
					window.location.href = 'auth/login';
				}
			}
		} catch(e){} // eslint-disable-line no-empty

		return this._super(...arguments);
	}
});
