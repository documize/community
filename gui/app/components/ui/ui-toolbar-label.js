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
	tagName: 'div',
	classNames: ['label'],
	classNameBindings: ['calcClass'],
	color: '',
	label: '',
	tooltip: '',
	selected: false,
	ariaRole: "button",
	tabindex: 0,
	attributeBindings: ['title'],
	title: computed('tooltip', function() {
		return this.tooltip;
	}),

	calcClass: computed('selected', function() {
		let c = '';
		if (this.color !== '') c += this.color + ' ';

		if (this.selected === true) c += 'label-selected';

		return c.trim();
	}),

	click(e) {
		if (!_.isUndefined(this.onClick)) {
			this.onClick(e);
			return;
		}
		if (!_.isUndefined(this.linkTo)) {
			// TODO: pass in linkModel, linkOptions
			// https://emberjs.com/api/ember/3.5/classes/RouterService/methods/transitionTo?anchor=transitionTo
			this.router.transitionTo(this.linkTo);
		}
	}
});
