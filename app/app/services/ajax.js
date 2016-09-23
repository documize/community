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
import AjaxService from 'ember-ajax/services/ajax';
import config from '../config/environment';

const {
	computed,
	inject: { service }
} = Ember;

export default AjaxService.extend({
	session: service(),
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
	})
});
