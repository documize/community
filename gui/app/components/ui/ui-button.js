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
	tagName: 'button',
	classNames: [],
	classNameBindings: ['calcClass'],

	label: '',
	icon: '',
	color: '',
	light: false,
	themed: false,

	iconClass: '',
	hasIcon: computed('iconClass', function() {
		return this.iconClass.trim() != '';
	}),

	calcClass: computed(function() {
		// Prepare icon class name
		let ic = '';
		let icon = this.icon;

		if (icon === 'delete') ic = 'dicon-bin';
		if (icon === 'print') ic = 'dicon-print';
		if (icon === 'settings') ic = 'dicon-settings-gear';
		if (icon === 'plus') ic = 'dicon-e-add';
		if (icon === 'person') ic = 'dicon-single-01';
		this.iconClass = ic;

		// Prepare button class name
		let bc = 'dmz-button';
		if (this.themed) {
			bc += '-theme';
		} else {
			bc += '-' + this.color;
		}

		if (this.light) {
			bc += '-light';
		}

		return bc;
	}),

	click() {
		this.onClick();
	}
});
