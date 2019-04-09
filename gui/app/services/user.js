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

import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
	sessionService: service('session'),
	ajax: service(),
	store: service(),

	// Adds a new user.
	add(user) {
		return this.get('ajax').request(`users`, {
			type: 'POST',
			data: JSON.stringify(user),
			contentType: 'json'
		}).then((response) => {
			let data = this.get('store').normalize('user', response);
			return this.get('store').push(data);
		});
	},

	// Adds comma-delim list of users (firstname, lastname, email).
	addBulk(list) {
		return this.get('ajax').request(`users/import`, {
				type: 'POST',
				data: list,
				contentType: 'text'
			}).then(() => {
		});
	},

	// Returns user model for specified user id.
	getUser(userId) {
		let url = `users/${userId}`;

		return this.get('ajax').request(url, {
			type: 'GET'
		}).then((response) => {
			let data = this.get('store').normalize('user', response);
			return this.get('store').push(data);
		});
	},

	// Returns all active users for organization.
	getAll() {
		return this.get('ajax').request(`users?active=1`).then((response) => {
			if (!_.isArray(response)) response = [];

			return response.map((obj) => {
				let data = this.get('store').normalize('user', obj);
				return this.get('store').push(data);
			});
		});
	},

	// Returns all active and inactive users for organization.
	// Only available for admins and limits results to max. 100 users.
	// Takes filter for user search criteria.
	getComplete(filter, limit) {
		filter = filter.trim();
		if (filter.length > 0) filter = encodeURIComponent(filter);
		if (_.isNull(limit) || _.isUndefined(limit)) limit = 100;

		return this.get('ajax').request(`users?active=0&filter=${filter}&limit=${limit}`).then((response) => {
			if (!_.isArray(response)) response = [];

			return response.map((obj) => {
				let data = this.get('store').normalize('user', obj);
				return this.get('store').push(data);
			});
		});
	},

	// Returns all users that can see space.
	getSpaceUsers(spaceId) {
		let url = `users/space/${spaceId}`;

		return this.get('ajax').request(url, {
			method: "GET"
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('user', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Updates an existing user record.
	save(user) {
		let userId = user.id;
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

		if (isEmpty(email)) {
			return RSVP.reject("invalid");
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

		if (isEmpty(token) || isEmpty(password)) {
			return RSVP.reject("invalid");
		}

		return this.get('ajax').request(url, {
			method: "POST",
			data: password
		});
	},

	// matchUsers on firstname, lastname, email
	matchUsers(text, limit) {
		if (_.isNull(limit) || _.isUndefined(limit)) limit = 100;

		return this.get('ajax').request(`users/match?limit=${limit}`, {
			method: 'POST',
			dataType: 'json',
			contentType: 'text',
			data: text
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('user', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	}
});
