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

import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
	userService: service('user'),
	globalSvc: service('global'),
	syncInProgress: false,
	userLimit: 25,

	loadUsers(filter) {
		this.get('userService').getComplete(filter, this.get('userLimit')).then((users) => {
			this.set('model', users);
		});
	},

	actions: {
		onAddUser(user) {
			return this.get('userService').add(user).then((user) => {
				this.get('model').pushObject(user);
			});
		},

		onAddUsers(list) {
			return this.get('userService').addBulk(list).then(() => {
				this.loadUsers('');
			});
		},

		onDelete(userId) {
			this.get('userService').remove(userId).then( () => {
				this.loadUsers('');
			});
		},

		onSave(user) {
			this.get('userService').save(user).then(() => {
				this.loadUsers('');
			});
		},

		onPassword(user, password) {
			this.get('userService').updatePassword(user.id, password);
		},

		onFilter(filter) {
			this.loadUsers(filter);
		},

		onSyncKeycloak() {
			this.set('syncInProgress', true);
			this.get('globalSvc').syncKeycloak().then(() => {
				this.set('syncInProgress', false);
				this.loadUsers('');
			});
		},

		onSyncLDAP() {
			this.set('syncInProgress', true);
			this.get('globalSvc').syncLDAP().then(() => {
				this.set('syncInProgress', false);
				this.loadUsers('');
			});
		}
	}
});
