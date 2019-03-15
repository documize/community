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
import Component from '@ember/component';

export default Component.extend({
	searchSvc: service('search'),
	results: A([]),
	validSearch: true,
	keywords: '' ,
	matchFilter: null,

	didReceiveAttrs() {
		this._super(...arguments);
		this.set('keywords', this.get('filter'));
		this.set('matchFilter', this.get('matchFilter'));
		this.fetch();
	},

	fetch() {
		let payload = {
			keywords: this.get('keywords'),
			doc: this.get('matchFilter.matchDoc'),
			attachment: this.get('matchFilter.matchFile'),
			tag: this.get('matchFilter.matchTag'),
			content: this.get('matchFilter.matchContent'),
			slog: this.get('matchFilter.slog')
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

		this.get('searchSvc').find(payload).then( (response) => {
			this.set('results', response);
		});
	},

	actions: {
		onSearch() {
			if (this.get('keywords').trim().length < 3) {
				this.set('validSearch', false);
				return;
			}

			this.set('validSearch', true);
			this.fetch();
		}
	}
});
