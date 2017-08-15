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

export default Ember.Component.extend({
	results: [],
	resultPhrase: "",

	didReceiveAttrs() {
		let docs = this.get('results');
		let phrase = 'Nothing found';

		if (docs.length > 0) {
			let references = docs.length === 1 ? "reference" : "references";
			let i = docs.length;
			phrase = `${i} ${references}`;
		}

		this.set('resultPhrase', phrase);
		this.set('documents', docs);
	}
});
