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

import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
	sessionService: service('session'),
	ajax: service(),
	store: service(),

	importSavedTemplate: function (folderId, templateId, docName) {
		let url = `templates/${templateId}/folder/${folderId}?type=saved`;

		return this.get('ajax').request(url, {
			method: 'POST',
			data: docName
		}).then((doc) => {
			let data = this.get('store').normalize('document', doc);
			return this.get('store').push(data);
		});
	},

	getSavedTemplates(folderId) {
		return this.get('ajax').request(`templates/${folderId}`, {
			method: 'GET'
		}).then((response) => {
			if (!_.isArray(response)) response = [];

			let templates = ArrayProxy.create({
				content: A([])
			});

			templates = response.map((template) => {
				let data = this.get('store').normalize('document', template);
				return this.get('store').push(data);
			});

			return templates;
		});
	},

	saveAsTemplate(documentId, name, excerpt) {
		let payload = {
			DocumentID: documentId,
			Name: name,
			Excerpt: excerpt
		};

		return this.get('ajax').request(`templates`, {
			method: 'POST',
			data: JSON.stringify(payload)
		}).then(() => {});
	}
});
