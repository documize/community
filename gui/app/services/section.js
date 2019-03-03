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
	store: service(),

	// Returns all available sections.
	getAll() {
		return this.get('ajax').request(`sections`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('section', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Requests data from the specified section handler, passing the method and document ID
	// and POST payload.
	fetch(page, method, data) {
		let documentId = page.get('documentId');
		let section = page.get('contentType');
		let url = `sections?documentID=${documentId}&section=${section}&method=${method}`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(data),
			contentType: "application/json"
		});
	},

	// Requests data from the specified section handler, passing the method and document ID
	// and POST payload.
	fetchText(page, method, data) {
		let documentId = page.get('documentId');
		let section = page.get('contentType');
		let url = `sections?documentID=${documentId}&section=${section}&method=${method}`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: "html"
		});
	},

	// Did any dynamic sections change? Fetch and send up for rendering?
	refresh(documentId) {
		let url = `sections/refresh?documentID=${documentId}`;

		return this.get('ajax').request(url, {
			method: 'GET'
		}).then((response) => {
			let pages = [];
			if (!_.isArray(response)) response = [];

			if (!_.isNull(response) && _.isArray(response) && response.length > 0) {
				pages = response.map((page) => {
					let data = this.get('store').normalize('page', page);
					return this.get('store').push(data);
				});
			}

			return pages;
		}).catch((/*error*/) => {
			// we ignore any error to cater for anon users who don't
			// have permissions to perform refresh
		});
	},

	/**************************************************
	 * Reusable Content Blocks
	 **************************************************/

	// Save new reusable content block.
	addBlock(payload) {
		let url = `sections/blocks`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(payload),
			contentType: 'json'
		}).then((response) => {
			let data = this.get('store').normalize('block', response);
			return this.get('store').push(data);
		});
	},

	// Returns reusable content block.
	getBlock(blockId) {
		return this.get('ajax').request(`sections/blocks/${blockId}`, {
			method: 'GET'
		}).then((response) => {
			let data = this.get('store').normalize('block', response);
			return this.get('store').push(data);
		});
	},

	// Returns all available reusable content block for section.
	getSpaceBlocks(folderId) {
		return this.get('ajax').request(`sections/blocks/space/${folderId}`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			if (!_.isArray(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('block', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Returns reusable content block.
	updateBlock(block) {
		return this.get('ajax').request(`sections/blocks/${block.id}`, {
			method: 'PUT',
			data: JSON.stringify(block)
		});
	},

	// Removes specified reusable content block.
	deleteBlock: function (blockId) {
		let url = `sections/blocks/${blockId}`;

		return this.get('ajax').request(url, {
			method: 'DELETE'
		});
	}
});
