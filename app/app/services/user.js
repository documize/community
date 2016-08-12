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

export default Ember.Service.extend({
	sessionService: Ember.inject.service('session'),
	ajax: Ember.inject.service(),
	store: Ember.inject.service(),

	// Adds a new user.
	add(user) {
		return this.get('ajax').request(`users`, {
			type: 'POST',
			data: JSON.stringify(user),
			contentType: 'json'
		}).then((response) => {
			let user = this.get('store').normalize('user', response);
			return this.get('store').push({ data: user });
		});
	},

	// Returns user model for specified user id.
	getUser(userId) {
		let url = `users/${userId}`;

		return this.get('ajax').request(url, {
			type: 'GET'
		}).then((response) => {
			let user = this.get('store').normalize('user', response);
			return this.get('store').push({ data: user });
		});
	},

	// Returns all users for organization.
	getAll() {
		return this.get('ajax').request(`users`).then((response) => {
			return response.map((obj) => {
				let user = this.get('store').normalize('user', obj);
				return this.get('store').push({ data: user });
			});
		});
	},

	// Returns all users that can see folder.
	getFolderUsers(folderId) {
		let url = `users/folder/${folderId}`;

		return this.get('ajax').request(url, {
			method: "GET"
		}).then((response) => {
			let data = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('user', obj);
				return this.get('store').push({ data: data })
			});

			return data;
		});
	},

	// Updates an existing user record.
	save(user) {
		let userId = user.get('id');
		let url = `users/${userId}`;

		return this.get('ajax').request(url, {
			type: 'PUT',
			data: JSON.stringify(user),
			contentType: 'json'
		});
	},

	// updatePassword changes the password for the specified user.
	updatePassword(userId, password) {
		let url = `users/${userId}/password`;

		return this.get('ajax').post(url, {
			data: password
		});
	},

	// Removes the specified user.
	remove(userId) {
		let url = `users/${userId}`;

		return this.get('ajax').request(url, {
			method: 'DELETE'
		}).then(() => {
			let user = this.get('store').peekRecord('user', `${userId}`);
			return user.deleteRecord();
		});
	},

	// Request password reset.
	forgotPassword(email) {
		let url = `public/forgot`;

		if (is.empty(email)) {
			return Ember.RSVP.reject("invalid");
		}

		let data = JSON.stringify({
			email: email
		});

		return this.get('ajax').request(url, {
			method: 'POST',
			dataType: 'json',
			data: data
		});
	},

	// Set new password.
	resetPassword(token, password) {
		var url = `public/reset/${token}`;

		if (is.empty(token) || is.empty(password)) {
			return Ember.RSVP.reject("invalid");
		}

		return this.get('ajax').request(url, {
			method: "POST",
			data: password
		});
	}
});
