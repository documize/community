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
import SimpleAuthSession from 'ember-simple-auth/services/session';
import config from '../config/environment';

const {
	inject: { service },
	computed
} = Ember;

export default SimpleAuthSession.extend({
	ajax: service(),
	appMeta: service(),
	store: service(),

	isMac: false,
	isMobile: false,
	authenticated: computed('user.id', function () {
		return this.get('user.id') !== '0';
	}),
	isAdmin: computed('user', function () {
		let data = this.get('user');
		return data.get('admin');
	}),
	isEditor: computed('user', function () {
		let data = this.get('user');
		return data.get('editor');
	}),
	isGlobalAdmin: computed('user', function () {
		let data = this.get('user');
		return data.get('global');
	}),
	assetURL: null,


	init: function () {
		this._super(...arguments);

		this.set('isMac', is.mac());
		this.set('isMobile', is.mobile());
		this.set('assetURL', config.rootURL);
	},

	user: computed('isAuthenticated', 'session.content.authenticated.user', function () {
		if (this.get('isAuthenticated')) {
			let user = this.get('session.content.authenticated.user') || { id: '' };
			let data = this.get('store').normalize('user', user);
			return this.get('store').push(data);
		}
	}),

	folderPermissions: null,
	currentFolder: null
});
