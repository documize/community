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

import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	resultPhrase: '',
	searchQuery: computed('keywords', function() {
		return encodeURIComponent(this.get('keywords'));
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		let docs = this.get('results');
		let duped = [];
		let phrase = 'Nothing found';

		if (docs.length > 0) {
			duped = _.uniq(docs, function (item) {
				return item.get('documentId');
			});

			let references = docs.length === 1 ? "reference" : "references";
			let docLabel = duped.length === 1 ? "document" : "documents";
			let i = docs.length;
			let j = duped.length;
			phrase = `${i} ${references} across ${j} ${docLabel}`;
		}

		this.set('resultPhrase', phrase);
		this.set('documents', duped);
	}
});
