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

import RSVP from 'rsvp';
import { inject as service } from '@ember/service';
import { isForbiddenError } from 'ember-ajax/errors';
import BaseService from '../services/base';

export default BaseService.extend({
	sessionService: service('session'),
	ajax: service(),
	localStorage: service(),
	store: service(),
	currentFolder: null,
	permissions: null,

	init() {
		this._super(...arguments);
		this.permissions = {};
	},

	// Add a new folder.
	add(payload) {
		return this.get('ajax').post(`space`, {
			contentType: 'json',
			data: JSON.stringify(payload)
		}).then((folder) => {
			let data = this.get('store').normalize('folder', folder);
			return this.get('store').push(data);
		});
	},

	// Returns folder model for specified folder id.
	getFolder(id) {
		return this.get('ajax').request(`space/${id}`, {
			method: 'GET'
		}).then((folder) => {
			let data = this.get('store').normalize('folder', folder);
			return this.get('store').push(data);
		}).catch((error) => {
			this.get('router').transitionTo('/not-found');
			return error;
		});
	},

	// Returns all folders that user can see.
	getAll() {
		let folders = this.get('space');

		if (folders != null) {
			return new RSVP.resolve(folders);
		}

		return this.reload();
	},

	// Updates an existing folder record.
	save(folder) {
		let id = folder.get('id');

		return this.get('ajax').request(`space/${id}`, {
			method: 'PUT',
			contentType: 'json',
			data: JSON.stringify(folder)
		});
	},

	remove(folderId, moveToId) {
		let url = `space/${folderId}/move/${moveToId}`;

		return this.get('ajax').request(url, {
			method: 'DELETE'
		});
	},

	delete(folderId) {
		return this.get('ajax').request(`space/${folderId}`, {
			method: 'DELETE'
		});
	},

	onboard(folderId, payload) {
		let url = `public/share/${folderId}`;

		return this.get('ajax').post(url, {
			contentType: "application/json",
			data: payload
		});
	},

	// reloads and caches folders
	reload() {
		return this.get('ajax').request(`space`, {
			method: "GET"
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('folder', obj);
				return this.get('store').push(data);
			});

			return data;
		}).catch((error) => {
			if (isForbiddenError(error)) {
				this.get('localStorage').clearAll();
				this.get('router').transitionTo('auth.login');
			}
			return error;
		});
	},

	// so who can see/edit this folder?
	getPermissions(folderId) {
		return this.get('ajax').request(`space/${folderId}/permissions`, {
			method: "GET"
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				obj.id = 'sp-' + obj.id;
				let data = this.get('store').normalize('space-permission', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// persist folder permissions
	savePermissions(folderId, payload) {
		return this.get('ajax').request(`space/${folderId}/permissions`, {
			method: 'PUT',
			contentType: 'json',
			data: JSON.stringify(payload)
		});
	},

	// share this folder with new users!
	share(folderId, invitation) {
		return this.get('ajax').post(`space/${folderId}/invitation`, {
			contentType: 'json',
			data: JSON.stringify(invitation)
		});
	},

	// Current folder caching
	setCurrentFolder(folder) {
		if (_.isUndefined(folder) || _.isNull(folder)) {
			return;
		}

		let folderId = folder.get('id');
		this.set('currentFolder', folder);
		this.get('localStorage').storeSessionItem("folder", folderId);

		let userId = this.get('sessionService.user.id');
		if (userId === "") {
			userId = "0";
		}

		let url = `space/${folderId}/permissions/user`;

		return this.get('ajax').request(url).then((response) => {
			response.id = 'u-' + response.id;
			let data = this.get('store').normalize('space-permission', response);
			let data2 = this.get('store').push(data);
			this.set('permissions', data2);
			return data2;
		});
	},

	// Returns all shared spaces and spaces without an owner.
	// Administrator only method.
	manage() {
		return this.get('ajax').request(`space/manage`, {
			method: "GET"
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('folder', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Add admin as space owner.
	grantOwnerPermission(folderId) {
		return this.get('ajax').request(`space/manage/owner/${folderId}`, {
			method: 'POST',
		});
	},
});
