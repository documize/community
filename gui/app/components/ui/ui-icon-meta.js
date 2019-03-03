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
	classNames: [''],
	classNameBindings: ['calcClass'],
	icon: null,

	calcClass: computed(function() {
		let icon = this.icon;
		let constants = this.get('constants');

		if (_.isNull(icon)) {
			return '';
		}

		if (_.isEmpty(icon)) {
			icon = constants.IconMeta.Apps;
		}

		return 'dmeta ' + icon;
	})
});
