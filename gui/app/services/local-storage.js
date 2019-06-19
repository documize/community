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

import Service from '@ember/service';

export default Service.extend({
	// Remove all items from storage.
	clearAll() {
		localStorage.clear();
	},

	// Generic session item CRUD methods.
	storeSessionItem: function (key, data) {
		localStorage[key] = data;
	},
	getSessionItem: function (key) {
		return localStorage[key];
	},
	clearSessionItem: function (key) {
		delete localStorage[key];
	},

	// Per document expand/collapse state.
	getDocSectionHide(docId) {
		let state = localStorage[`doc-hide-${docId}`];
		if (_.isUndefined(state) || _.isEmpty(state)) {
			return [];
		}

		return _.split(state, '|');
	},
	setDocSectionHide(docId, state) {
		let key = `doc-hide-${docId}`;

		if (state.length === 0) {
			delete localStorage[key];
		} else {
			localStorage[key] =  _.join(state, '|');
		}
	},

	// First run wizard.
	setFirstRun() {
		localStorage['firstRun'] = true;
	},
	isFirstRun() {
		return !_.isUndefined(localStorage['firstRun']);
	},
	unsetFirstRun() {
		delete localStorage['firstRun'];
	}
});
