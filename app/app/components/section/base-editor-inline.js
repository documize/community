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

const {
	computed,
} = Ember;


export default Ember.Component.extend({
	drop: null,
	tip: "Short and concise title",
	busy: false,

	hasNameError: computed.empty('page.title'),
	pageId: Ember.computed('page', function () {
		let page = this.get('page');
		return `page-editor-${page.id}`;
	}),

	didRender() {
		let self = this;
		Mousetrap.bind('esc', function () {
			self.send('onCancel');
			return false;
		});
		Mousetrap.bind(['ctrl+s', 'command+s'], function () {
			self.send('onAction');
			return false;
		});

		$('#' + this.get('pageId')).focus(function() {
			$(this).select();
		});
	},

	willDestroyElement() {
		let drop = this.get('drop');

		if (is.not.null(drop)) {
			drop.destroy();
		}
	},

	actions: {
		onCancel() {
			if (this.attrs.isDirty() !== null && this.attrs.isDirty()) {
				$(".discard-edits-dialog").css("display", "block");

				let page = this.get('page');

				let drop = new Drop({
					target: $("#editor-cancel" + page.get('id'))[0],
					content: $(".cancel-edits-dialog-" + page.get('id'))[0],
					classes: 'drop-theme-basic',
					position: "bottom right",
					openOn: "always",
					tetherOptions: {
						offset: "5px 0",
						targetOffset: "10px 0"
					},
					remove: false
				});

				this.set('drop', drop);

				return;
			}

			this.attrs.onCancel();
		},

		onAction() {
			if (this.get('busy')) {
				return;
			}

			if (is.empty(this.get('page.title'))) {
				return;
			}

			this.attrs.onAction(this.get('page.title'));
		},

		keepEditing() {
			let drop = this.get('drop');
			drop.close();
		},

		discardEdits() {
			this.attrs.onCancel();
		}
	}
});
