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

import { set } from '@ember/object';

import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import NotifierMixin from '../../../mixins/notifier';

export default Controller.extend(NotifierMixin, {
	userService: service('user'),
	newUser: { firstname: "", lastname: "", email: "", active: true },

	actions: {
		add(user) {
			set(this, 'newUser', user);

			return this.get('userService')
				.add(this.get('newUser'))
				.then((user) => {
					this.showNotification('Added');
					this.get('model').pushObject(user);
				})
				.catch(function (error) {
					let msg = error.status === 409 ? 'Unable to add duplicate user' : 'Unable to add user';
					this.showNotification(msg);
				});
		},

		onDelete(userId) {
			let self = this;
			this.get('userService').remove(userId).then(function () {
				self.showNotification('Deleted');

				self.get('userService').getComplete().then(function (users) {
					self.set('model', users);
				});
			});
		},

		onSave(user) {
			let self = this;
			this.get('userService').save(user).then(function () {
				self.showNotification('Saved');

				self.get('userService').getComplete().then(function (users) {
					self.set('model', users);
				});
			});
		},

		onPassword(user, password) {
			this.get('userService').updatePassword(user.id, password);
			this.showNotification('Password changed');
		}
	}
});
