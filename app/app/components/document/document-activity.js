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
	sortedItems: [],

	didReceiveAttrs() {
		let editors = this.get('activity.editors');
		let viewers = this.get('activity.viewers');
		let pages = this.get('pages');
		let sorted = [];

		if (is.null(editors)) {
			editors = [];
		}

		if (is.null(viewers)) {
			viewers = [];
		}

		viewers.forEach((item) => {
			Ember.set(item, 'changeLabel', "viewed");
			Ember.set(item, "viewed", true);
			sorted.pushObject({ date: item.created, item: item });
		});

		editors.forEach(function (item) {
			Ember.set(item, "added", item.action === "add-page");
			Ember.set(item, "changed", item.action === "update-page");
			Ember.set(item, "deleted", item.action === "remove-page");

			let page = pages.findBy('id', item.pageId);
			let title = "";

			if (item.deleted || is.undefined(page)) {
				title = "removed section";
			} else {
				if (item.added) {
					title = "added " + page.get('title');
				}

				if (item.changed) {
					title = "changed " + page.get('title');
				}
			}

			Ember.set(item, 'changeLabel', title);

			let exists = sorted.findBy('item.pageId', item.pageId);

			if (is.undefined(exists)) {
				sorted.pushObject({ date: item.created, item: item });
			}
		});

		this.set('sortedItems', _.sortBy(sorted, 'date').reverse());
	}
});
