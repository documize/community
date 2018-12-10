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
	tagName: 'i',
	classNames: ['dicon'],
	classNameBindings: ['calcClass'],

	color: '',
	icon: '',

	calcClass: computed(function() {
		let c = '';
		let icon = this.icon;

		switch (this.color) {
			case 'red':
				c += 'red';
				break;
			case 'yellow':
				c += 'yellow';
				break;
			case 'green':
				c += 'green';
				break;
		}
		c += ' ';

		if (icon === 'delete') c += 'dicon-bin';
		if (icon === 'print') c += 'dicon-print';
		if (icon === 'settings') c += 'dicon-settings-gear';
		if (icon === 'plus') c += 'dicon-e-add';
		if (icon === 'person') c += 'dicon-single-01';
		c += ' ';


		return c.trim();
	}),

	click() {
		this.onClick();
	}
});
