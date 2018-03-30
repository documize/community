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
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
	searchService: service('search'),
	queryParams: ['filter', 'matchDoc', 'matchContent', 'matchTag', 'matchFile'],
	filter: '',
	matchDoc: true,
	matchContent: true,
	matchTag: false,
	matchFile: false,
	results: A([]),

	fetch() {
		let self = this;
		let payload = {
			keywords: this.get('filter'),
			doc: this.get('matchDoc'),
			attachment: this.get('matchFile'),
			tag: this.get('matchTag'),
			content: this.get('matchContent')
		};

		payload.keywords = payload.keywords.trim();

		if (payload.keywords.length == 0) {
			this.set('results', A([]));
			return;
		}
		if (!payload.doc && !payload.tag && !payload.content && !payload.attachment) {
			this.set('results', A([]));
			return;
		}

		this.get('searchService').find(payload).then(function(response) {
			self.set('results', response);
		});
	},

	actions: {
		onSearch() {
			this.fetch();
		}
	}
});
