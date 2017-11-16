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

import { htmlSafe } from '@ember/string';

import { computed, set } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	myWidth: computed('tabs', function() {
		let count = this.get('tabs.length');
		let width = 95 / count;
		return htmlSafe("width: " + `${width}%;`);
	}),

	actions: {
		onTabSelect(tab) {
			this.get('tabs').forEach(t => {
				set(t, 'selected', false);
			});

			set(tab, 'selected', true);

			this.attrs.onTabSelect(this.get('tabs'));
		}
	}
});
