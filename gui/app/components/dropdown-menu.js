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
import stringUtil from '../utils/string';

export default Ember.Component.extend({
	target: null,
	open: "click",
	position: 'bottom right',
	contentId: "",
	drop: null,
	onOpenCallback: null, // callback when opened
	onCloseCallback: null, // callback when closed
	tether: Ember.inject.service(),

	didReceiveAttrs() {
		this.set("contentId", 'dropdown-menu-' + stringUtil.makeId(10));
	},

	didInsertElement() {
		this._super(...arguments);
		let self = this;

		let drop = this.get('tether').createDrop({
			target: document.getElementById(self.get('target')),
			content: self.$(".dropdown-menu")[0],
			classes: 'drop-theme-menu',
			position: self.get('position'),
			openOn: self.get('open'),
			constrainToWindow: false,
			constrainToScrollParent: false,
			tetherOptions: {
				offset: "5px 0",
				targetOffset: "10px 0",
				targetModifier: 'scroll-handle',
			},
			remove: true
		});

		if (drop) {
			drop.on('open', function () {
				if (is.not.null(self.get("onOpenCallback"))) {
					self.attrs.onOpenCallback(drop);
				}
			});
			drop.on('close', function () {
				if (is.not.null(self.get("onCloseCallback"))) {
					self.attrs.onCloseCallback();
				}
			});

			self.set('drop', drop);
		}
	},

	willDestroyElement() {
		let drop = this.get('drop');
		if (drop) {
			drop.destroy();
		}
	}
});
