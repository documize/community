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

const {
	inject: { service }
} = Ember;

export default Ember.Service.extend({
	sessionService: service('session'),
	ajax: service(),
	appMeta: service(),
	store: service(),

	// Returns attributes for specified org id.
	getOrg(id) {
		return this.get('ajax').request(`organizations/${id}`, {
			method: 'GET'
		}).then((response) => {
			let data = this.get('store').normalize('organization', response);
			return this.get('store').push({ data: data });
		});
	},

	// Updates an existing organization record.
	save(org) {
		let id = org.get('id');

		this.get('appMeta').setProperties({
			message: org.message,
			title: org.title
		});

		return this.get('ajax').request(`organizations/${id}`, {
			method: 'PUT',
			data: JSON.stringify(org)
		});
	}
});
