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
	document: {},
	meta: [],
	pages: [],

	didReceiveAttrs() {
		let editors = this.get('meta.editors');
		let toc = this.get('pages');

		if (is.null(editors)) {
			return;
		}

		editors.forEach(function (item) {
			Ember.set(item, "added", item.action === "add-page");
			Ember.set(item, "changed", item.action === "update-page");
			Ember.set(item, "deleted", item.action === "remove-page");

			let page = _.findWhere(toc, {
				id: item.pageId
			});
			let title = "";

			if (is.not.undefined(page)) {
				title = page.get('title');

				if (item.added) {
					Ember.set(item, 'changeLabel', "added " + title);
				}

				if (item.changed) {
					Ember.set(item, 'changeLabel', "changed " + title);
				}
			} else {
				Ember.set(item, "deleted", true);

				if (item.added) {
					Ember.set(item, 'changeLabel', "added section (since removed)");
				}

				if (item.changed) {
					Ember.set(item, 'changeLabel', "changed section (since removed)");
				}

				if (item.deleted) {
					Ember.set(item, 'changeLabel', "removed section");
				}
			}
		});
	}
});
