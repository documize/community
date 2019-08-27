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

	// Add category to space
	add(payload) {
		return this.get('ajax').post(`category`, {
			contentType: 'json',
			data: JSON.stringify(payload)
		}).then((category) => {
			let data = this.get('store').normalize('category', category);
			return this.get('store').push(data);
		});
	},

	// Returns space categories viewable by user.
	getUserVisible(spaceId) {
		return this.get('ajax').request(`category/space/${spaceId}`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('category', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Returns all space categories for admin user.
	getAll(spaceId) {
		return this.get('ajax').request(`category/space/${spaceId}?filter=all`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('category', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Updates an existing category.
	save(category) {
		let id = category.get('id');

		return this.get('ajax').request(`category/${id}`, {
			method: 'PUT',
			contentType: 'json',
			data: JSON.stringify(category)
		}).then((category) => {
			let data = this.get('store').normalize('category', category);
			return this.get('store').push(data);
		});
	},

	delete(categoryId) {
		return this.get('ajax').request(`category/${categoryId}`, {
			method: 'DELETE'
		});
	},

	// Get viewer permission records for given category
	getPermissions(categoryId) {
		return this.get('ajax').request(`category/${categoryId}/permission`, {
			method: 'GET'
		}).then((response) => {
			// return response;
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('category-permission', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Get list of users who can see given category
	getUsers(categoryId) {
		return this.get('ajax').request(`category/${categoryId}/user`, {
			method: 'GET'
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

	// Save list of users who can see given category
	setViewers(spaceId, categoryId, viewers) {
		return this.get('ajax').request(`category/${categoryId}/permission?space=${spaceId}`, {
			method: 'PUT',
			contentType: 'json',
			data: JSON.stringify(viewers)
		});
	},

	// Get count of documents and users associated with each category in given space.
	getSummary(spaceId) {
		return this.get('ajax').request(`category/space/${spaceId}/summary`, {
			method: 'GET'
		}).then((response) => {
			return response;
		});
	},

	setCategoryMembership(categories, mode) {
		return this.get('ajax').request(`category/member?mode=${mode}`, {
			method: 'POST',
			contentType: 'json',
			data: JSON.stringify(categories)
		});
	},

	// Get categories associated with a document.
	getDocumentCategories(documentId) {
		return this.get('ajax').request(`category/document/${documentId}`, {
			method: 'GET'
		}).then((response) => {
			return response;
		});
	},

	getSpaceCategoryMembership(spaceId) {
		return this.get('ajax').request(`category/member/space/${spaceId}`, {
			method: 'GET'
		}).then((response) => {
			return response;
		});
	},

	// fetchXXX represents UI specific bulk data loading designed to
	// reduce network traffic and boost app performance.
	// This method returns:
	// 1. getUserVisible()
	// 2. getSummary()
	// 3. getSpaceCategoryMembership()
	fetchSpaceData(spaceId) {
		return this.get('ajax').request(`fetch/category/space/${spaceId}`, {
			method: 'GET'
		}).then((response) => {
			let data = {
				category: [],
				membership: [],
				summary: []
			};

			let cats = response.category.map((obj) => {
				let data = this.get('store').normalize('category', obj);
				return this.get('store').push(data);
			});

			data.category = cats;
			data.membership = response.membership;
			data.summary = response.summary;

			return data;
		});
	}
});
