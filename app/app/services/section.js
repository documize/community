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
import BaseService from '../services/base';

const {
	inject: { service }
} = Ember;

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

	// Did any dynamic sections change? Fetch and send up for rendering?
	refresh(documentId) {
		let url = `sections/refresh?documentID=${documentId}`;

		return this.get('ajax').request(url, {
			method: 'GET'
		}).then((response) => {
			let pages = [];

			if (is.not.null(response) && is.array(response) && response.length > 0) {
				pages = response.map((page) => {
					let data = this.get('store').normalize('page', page);
					return this.get('store').push(data);
				});
			}

			return pages;
		});
	},

	/******************************
	* Reusable section blocks
	******************************/

	// Saves section as template
	saveSectionTemplate(payload) {
		let url = `sections/templates`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	// Returns all available sections.
	getSpaceSectionTemplates(folderId) {
		return this.get('ajax').request(`sections/templates/${folderId}`, {
			method: 'GET'
		}).then((response) => {
			let data = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('pageTemplate', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	}
});
