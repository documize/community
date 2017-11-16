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

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import stringUtil from '../utils/string';

export default Component.extend({
	drop: null,
	target: null,
	button: "Delete",
	color: "flat-red",
	button2: "",
	color2: "2",
	open: "click",
	position: 'bottom right',
	showCancel: true,
	contentId: "",
	focusOn: null, // is there an input field we need to focus?
	selectOn: null, // is there an input field we need to select?
	onOpenCallback: null, // callback when opened
	onAction: null,
	onAction2: null,
	offset: "5px 0",
	targetOffset: "10px 0",
	constrainToWindow: true,
	constrainToScrollParent: true,
	cssClass: '',
	tether: service(),

	hasSecondButton: computed('button2', 'color2', function () {
		return is.not.empty(this.get('button2')) && is.not.empty(this.get('color2'));
	}),

	didReceiveAttrs() {
		this.set("contentId", 'dropdown-dialog-' + stringUtil.makeId(10));
	},

	didInsertElement() {
		this._super(...arguments);
		// TODO: refactor to eliminate self
		let self = this;

		if (is.null(self.get('target'))) {
			return;
		}

		let drop = this.get('tether').createDrop({
			target: document.getElementById(self.get('target')),
			content: self.$(".dropdown-dialog")[0],
			classes: 'drop-theme-basic',
			position: self.get('position'),
			openOn: self.get('open'),
			constrainToWindow: true,
			constrainToScrollParent: false,
			tetherOptions: {
				offset: self.offset,
				targetOffset: self.targetOffset,
				// targetModifier: 'scroll-handle',
				constraints: [
					{
						to: 'scrollParent',
						attachment: 'together'
					}
				],
			},
			remove: true
		});

		if (drop) {
			drop.on('open', function () {
				if (is.not.null(self.get("focusOn"))) {
					document.getElementById(self.get("focusOn")).focus();
				}

				if (is.not.null(self.get("selectOn"))) {
					document.getElementById(self.get("selectOn")).select();
				}

				if (is.not.null(self.get("onOpenCallback"))) {
					self.attrs.onOpenCallback(drop);
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
	},

	actions: {
		onCancel() {
			let drop = this.get('drop');
			if (drop) {
				drop.close();
			}
		},

		onAction() {
			if (this.get('onAction') === null) {
				return;
			}

			let close = this.attrs.onAction();

			let drop = this.get('drop');
			if (close && drop) {
				drop.close();
			}
		},

		onAction2() {
			if (this.get('onAction2') === null) {
				return;
			}

			let close = this.attrs.onAction2();

			let drop = this.get('drop');
			if (close && drop) {
				drop.close();
			}
		}
	}
});
