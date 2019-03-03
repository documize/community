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
import BaseService from '../services/base';

export default BaseService.extend({
	sessionService: service('session'),
	ajax: service(),
	localStorage: service(),
	store: service(),

	// Add user group.
	add(payload) {
		return this.get('ajax').post(`group`, {
			contentType: 'json',
			data: JSON.stringify(payload)
		}).then((group) => {
			let data = this.get('store').normalize('group', group);
			return this.get('store').push(data);
		});
	},

	// Returns all groups for org.
	getAll() {
		return this.get('ajax').request(`group`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('group', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Updates an existing group.
	update(group) {
		let id = group.get('id');

		return this.get('ajax').request(`group/${id}`, {
			method: 'PUT',
			contentType: 'json',
			data: JSON.stringify(group)
		}).then((group) => {
			let data = this.get('store').normalize('group', group);
			return this.get('store').push(data);
		});
	},

	// Delete removes group and associated user membership.
	delete(groupId) {
		return this.get('ajax').request(`group/${groupId}`, {
			method: 'DELETE'
		});
	},

	// Returns users associated with given group
	getGroupMembers(groupId) {
		return this.get('ajax').request(`group/${groupId}/members`, {
			method: 'GET'
		}).then((response) => {
			let data = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('group-member', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// join adds user to group.
	join(groupId, userId) {
		return this.get('ajax').request(`group/${groupId}/join/${userId}`, {
			method: 'POST'
		});
	},

	// leave removes user from group.
	leave(groupId, userId) {
		return this.get('ajax').request(`group/${groupId}/leave/${userId}`, {
			method: 'DELETE'
		});
	},
});
