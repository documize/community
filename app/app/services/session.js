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
import models from '../utils/model';
import SimpleAuthSession from 'ember-simple-auth/services/session';

const {
	inject: { service },
	computed: { oneWay, or, notEmpty },
	computed
} = Ember;

export default SimpleAuthSession.extend({
	ajax: service(),
	appMeta: service(),

	isMac: false,
	isMobile: false,
	authenticated: notEmpty('user.id'),
	isAdmin: oneWay('user.admin'),
	isEditor: or('user.admin', 'user.editor'),

	init: function () {
		this.set('isMac', is.mac());
		this.set('isMobile', is.mobile());
	},

	user: computed('isAuthenticated', 'session.content.authenticated.user', function () {
		if (this.get('isAuthenticated')) {
			let user = this.get('session.content.authenticated.user') || { id: '' };
			return models.UserModel.create(user);
		}
	}),

	folderPermissions: null,
	currentFolder: null
});