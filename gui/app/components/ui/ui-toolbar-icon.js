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

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	router: service(),
	tagName: 'i',
	classNames: ['dicon'],
	classNameBindings: ['calcClass'],

	color: '',
	icon: '',
	tooltip: '',

	calcClass: computed(function() {
		let c = '';
		let icon = this.icon;

		if (this.color !== '') c += this.color + ' ';

		if (icon !== '') c += icon + ' ';

		return c.trim();
	}),

	click(e) {
		if (is.not.undefined(this.onClick)) {
			this.onClick(e);
			return;
		}

		if (is.not.undefined(this.linkTo)) {
			// TODO: pass in linkModel, linkOptions
			// https://emberjs.com/api/ember/3.5/classes/RouterService/methods/transitionTo?anchor=transitionTo
			this.router.transitionTo(this.get('linkTo'));
		}
	}
});
