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
import { set } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	appMeta: service(),
	onChange: null,
	colors: null,

	didReceiveAttrs() {
		this._super(...arguments);

		let colors = A([]);
		colors.pushObject({selected: false, code: '#263238'});
		colors.pushObject({selected: false, code: '#37474f'});
		colors.pushObject({selected: false, code: '#455a64'});
		colors.pushObject({selected: false, code: '#546e7a'});
		colors.pushObject({selected: false, code: '#4c4c4c'});
		colors.pushObject({selected: false, code: '#757575'});
		colors.pushObject({selected: false, code: '#616161'});
		colors.pushObject({selected: false, code: '#d50000'});
		colors.pushObject({selected: false, code: '#b71c1c'});
		colors.pushObject({selected: false, code: '#880e4f'});
		colors.pushObject({selected: false, code: '#c2185b'});
		colors.pushObject({selected: false, code: '#4a148c'});
		colors.pushObject({selected: false, code: '#6a1b9a'});
		colors.pushObject({selected: false, code: '#7b1fa2'});
		colors.pushObject({selected: false, code: '#311b92'});
		colors.pushObject({selected: false, code: '#0d47a1'});
		colors.pushObject({selected: false, code: '#1565c0'});
		colors.pushObject({selected: false, code: '#2962ff'});
		colors.pushObject({selected: false, code: '#039be5'});
		colors.pushObject({selected: false, code: '#00838f'});
		colors.pushObject({selected: false, code: '#006064'});
		colors.pushObject({selected: false, code: '#00897b'});
		colors.pushObject({selected: false, code: '#2e7d32'});
		colors.pushObject({selected: false, code: '#388e3c'});
		colors.pushObject({selected: false, code: '#4caf50'});
		colors.pushObject({selected: false, code: '#33691e'});
		colors.pushObject({selected: false, code: '#827717'});
		colors.pushObject({selected: false, code: '#f9a825'});
		colors.pushObject({selected: false, code: '#ffca28'});
		colors.pushObject({selected: false, code: '#ef6c00'});
		colors.pushObject({selected: false, code: '#bf360c'});
		colors.pushObject({selected: false, code: '#ff3d00'});
		colors.pushObject({selected: false, code: '#4e342e'});
		colors.pushObject({selected: false, code: '#6d4c41'});
		colors.pushObject({selected: false, code: '#8d6e63'});

		this.set('colors', colors);

		// Send back default color code in case user does not select
		// their own preference.
		this.setColor(colors[0].code);
	},

	setColor(colorCode) {
		let colors = this.get('colors');
		_.each(colors, (color) => {
			set(color, 'selected', color.code === colorCode ? true: false);
		});

		if (this.get('onChange') !== null) {
			this.get('onChange')(colorCode);
		}
	},

	actions: {
		onSelect(colorCode) {
			this.setColor(colorCode);
		}
	}
});
