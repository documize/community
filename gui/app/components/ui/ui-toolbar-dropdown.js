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
	classNames: [],
	classNameBindings: ['calcClass'],
	label: '',
	color: '',
	arrow: true,
	iconClass: '',
	ariaRole: "button",
	tabindex: 0,

	calcClass: computed(function() {
		// Prepare icon class name
		this.iconClass = this.get('constants').Icon.ArrowSmallDown;

		// Prepare button class name
		let bc = 'dropdown';

		if (!this.themed) {
			bc += ' dropdown-' + this.color;
		}

		return bc;
	}),

	calcAttrs: computed(function() {
		if (this.dismiss) {
			return 'modal';
		}

		return null;
	}),

	submitAttrs: computed(function() {
		return this.submit ? "submit": null;
	}),

	click(e) {
		if (!_.isUndefined(this.onClick)) {
			e.preventDefault();
			this.onClick(e);
		}
	}
});
