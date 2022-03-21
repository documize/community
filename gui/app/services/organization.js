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

import Service, { inject as service } from '@ember/service';

export default Service.extend({
	sessionService: service('session'),
	ajax: service(),
	appMeta: service(),
	store: service(),

	// Returns attributes for specified org id.
	getOrg(id) {
		return this.get('ajax').request(`organization/${id}`, {
			method: 'GET'
		}).then((response) => {
			let data = this.get('store').normalize('organization', response);
			return this.get('store').push(data);
		});
	},

	// Updates an existing organization record.
	save(org) {
		let id = org.id;

		this.get('appMeta').setProperties({
			message: org.get('message'),
			title: org.get('title'),
			maxTags: org.get('maxTags'),
			conversionEndpoint: org.get('conversionEndpoint'),
			locale: org.get('locale')
		});

		return this.get('ajax').request(`organization/${id}`, {
			method: 'PUT',
			data: JSON.stringify(org)
		});
	},

	getOrgSetting(orgId, key) {
		return this.get('ajax').request(`organization/${orgId}/setting?key=${key}`, {
			method: 'GET'
		}).then((response) => {
			return JSON.parse(response);
		});
	},

	saveOrgSetting(orgId, key, config) {
		return this.get('ajax').request(`organization/${orgId}/setting?key=${key}`, {
			method: 'POST',
			data: JSON.stringify(config)
		});
	},

	getGlobalSetting(key) {
		return this.get('ajax').request(`organization/setting?key=${key}`, {
			method: 'GET'
		}).then((response) => {
			return JSON.parse(response);
		});
	},

	saveGlobalSetting(key, config) {
		return this.get('ajax').request(`organization/setting?key=${key}`, {
			method: 'POST',
			data: JSON.stringify(config)
		});
	},

	useDefaultLogo(orgId) {
		return this.get('ajax').request(`organization/${orgId}/logo`, {
			method: 'POST',
			data: '',
		});
	}
});
