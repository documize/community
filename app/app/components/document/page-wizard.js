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
import NotifierMixin from '../../mixins/notifier';

const {
	computed,
} = Ember;

export default Ember.Component.extend(NotifierMixin, {
	display: 'section', // which CSS to use
	hasTemplates: false,

	didReceiveAttrs() {
		let blocks = this.get('blocks');

		this.set('hasBlocks', blocks.get('length') > 0);

		blocks.forEach((b) => {
			b.set('deleteId', `delete-block-button-${b.id}`);
		});
	},

	didRender() {
		let self = this;

		Mousetrap.bind('esc', function () {
			if (self.get('isDestroyed') || self.get('isDestroying')) {
				return;
			}

			self.send('onCancel');
			return false;
		});
	},

	actions: {
		onCancel() {
			this.attrs.onCancel();
		},

		addSection(section) {
			this.attrs.onAddSection(section);
		},

		onDeleteBlock(id) {
			this.attrs.onDeleteBlock(id);
		},

		onInsertBlock(block) {
			this.attrs.onInsertBlock(block);
		}
	}
});
