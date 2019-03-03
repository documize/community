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

	// Add space label.
	add(payload) {
		return this.get('ajax').post(`label`, {
			contentType: 'json',
			data: JSON.stringify(payload)
		}).then((label) => {
			let data = this.get('store').normalize('label', label);
			return this.get('store').push(data);
		});
	},

	// Fetch all available space labels.
	getAll() {
		return this.get('ajax').request(`label`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			if (_.isNull(response)) response = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('label', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Updates an existing space label.
	update(label) {
		let id = label.get('id');

		return this.get('ajax').request(`label/${id}`, {
			method: 'PUT',
			contentType: 'json',
			data: JSON.stringify(label)
		}).then((label) => {
			let data = this.get('store').normalize('label', label);
			return this.get('store').push(data);
		});
	},

	delete(labelId) {
		return this.get('ajax').request(`label/${labelId}`, {
			method: 'DELETE'
		});
	}
});
