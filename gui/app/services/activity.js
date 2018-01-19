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
	store: service(),
	
	// document number of views, edits, approvals, etc.
	getDocumentSummary(documentId, days) {
		return this.get('ajax').request(`activity/document/${documentId}?days=${days}`, {
			method: "GET"
		}).then((response) => {
			let data = {
				viewers: [],
				changers: []
			};

			data.viewers = response.viewers.map((obj) => {
				let data = this.get('store').normalize('documentActivity', obj);
				return this.get('store').push(data);
			});

			data.changers = response.changers.map((obj) => {
				let data = this.get('store').normalize('documentActivity', obj);
				return this.get('store').push(data);
			});

			return data;
		}).catch(() => {
			return [];
		});
	},
});
