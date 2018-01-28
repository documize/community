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

import { set } from '@ember/object';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	nameField: 'category',
	singleSelect: false,
	maxHeight: 0,
	onSelect: null,
	styleCss: computed('maxHeight', function () {
		let height = this.get('maxHeight');

		if (height > 0) {
			return `overflow-y: scroll; max-height: ${height}px;`;
		} else {
			return '';
		}
	}),

	init() {
		this._super(...arguments);
	},

	actions: {
		onToggle(item) {
			// callback takes precedence
			// caller sets item to 'selected'
			let cb = this.get('onSelect');
			if (cb !== null) {
				let cb = this.get('onSelect');
				cb(item);
				return;
			}

			// no callback, we mark item as selected
			if (this.get('singleSelect')) {
				let items = this.get('items');
				items.forEach(item => {
					set(item, 'selected', false);
				});
				this.set('items', items);
			}

			set(item, 'selected', !item.get('selected'));
		}
	}
});
