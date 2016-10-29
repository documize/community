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
	myWidth: Ember.computed('tabs', function() {
		let count = this.get('tabs.length');
		let width = 95 / count;
		return Ember.String.htmlSafe("width: " + `${width}%;`);
	}),

	actions: {
		onTabSelect(tab) {
			this.get('tabs').forEach(t => {
				Ember.set(t, 'selected', false);
			});

			Ember.set(tab, 'selected', true);

			this.attrs.onTabSelect(this.get('tabs'));
		}
	}
});
