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
import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';

export default Service.extend({
	sessionService: service('session'),
	ajax: service(),
	store: service(),

	// find all matching documents
	find(payload) {
		return this.get('ajax').request("search", {
			method: "POST",
			data: JSON.stringify(payload),
			contentType: 'json'
		}).then((response) => {
			if (!_.isArray(response)) response = [];

			let results = ArrayProxy.create({
				content: A([])
			});

			results = response.map((doc) => {
				let data = this.get('store').normalize('doc-search-result', doc);
				return this.get('store').push(data);
			});

			return results;
		}).catch((error) => {
			return error;
		});
	},
});
