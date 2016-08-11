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
import BaseService from '../services/base';

export default BaseService.extend({
	sessionService: Ember.inject.service('session'),
	ajax: Ember.inject.service(),
	store: Ember.inject.service(),

	// Returns all available sections.
	getAll() {
		return this.get('ajax').request(`sections`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			_.each(response, (obj) => {
				debugger;
				let sectionData = this.get('store').normalize('section', obj);
				let section = this.get('store').push({ data: sectionData });
				data.pushObject(section);
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
				_.each(response, (page) => {
					let data = this.get('store').normalize('page', page);
					let pageData = this.get('store').push({ data: data });
					pages.pushObject(pageData);
				});
			}

			return pages;
		});
	}
});
