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

export default Ember.Controller.extend({
	searchService: Ember.inject.service('search'),
	filter: "",
	results: [],
	matchDoc: true,
	matchContent: true,
	matchFile: false,
	matchTag: false,

	onKeywordChange: function () {
		Ember.run.debounce(this, this.fetch, 750);
	}.observes('filter'),

	onMatchDoc: function () {
		Ember.run.debounce(this, this.fetch, 750);
	}.observes('matchDoc'),
	onMatchContent: function () {
		Ember.run.debounce(this, this.fetch, 750);
	}.observes('matchContent'),
	onMatchTag: function () {
		Ember.run.debounce(this, this.fetch, 750);
	}.observes('matchTag'),
	onMatchFile: function () {
		Ember.run.debounce(this, this.fetch, 750);
	}.observes('matchFile'),

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
			return;
		}
		if (!payload.doc && !payload.tag && !payload.content && !payload.attachment) {
			return;
		}

		this.get('searchService').find(payload).then(function(response) {
			self.set('results', response);
		});
	},
});
