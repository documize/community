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

const {
	inject: { service },
	computed
} = Ember;

export default SimpleAuthSession.extend({
	ajax: service(),
	appMeta: service(),
	store: service(),
	localStorage: service(),
	folderPermissions: null,
	currentFolder: null,
	isMac: false,
	isMobile: false,

	user: computed('isAuthenticated', 'session.content.authenticated.user', function () {
		if (this.get('isAuthenticated')) {
			let user = this.get('session.content.authenticated.user') || { id: '' };
			let data = this.get('store').normalize('user', user);
			return this.get('store').push(data);
		}
	}),
	authenticated: computed('session.content.authenticated.user', function () {
		return this.get('session.content.authenticated.user.id') !== '0';
	}),
	isAdmin: computed('session.content.authenticated.user', function () {
		return this.get('session.content.authenticated.user.admin') === true;
	}),
	isEditor: computed('session.content.authenticated.user', function () {
		return this.get('session.content.authenticated.user.editor') === true;
	}),
	isGlobalAdmin: computed('session.content.authenticated.user', function () {
		return this.get('session.content.authenticated.user.global') === true;
	}),

	init() {
		this._super(...arguments);
		
		this.set('isMac', is.mac());
		this.set('isMobile', is.mobile());
	},

	logout() {
		this.get('localStorage').clearAll();
	}
});
