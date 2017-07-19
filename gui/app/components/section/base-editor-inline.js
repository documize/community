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
	busy: false,
	mousetrap: null,
	hasNameError: computed.empty('page.title'),
	containerId: Ember.computed('page', function () {
		let page = this.get('page');
		return `base-editor-inline-container-${page.id}`;
	}),
	pageId: Ember.computed('page', function () {
		let page = this.get('page');
		return `page-editor-${page.id}`;
	}),
	cancelId: Ember.computed('page', function () {
		let page = this.get('page');
		return `cancel-edits-button-${page.id}`;
	}),
	dialogId: Ember.computed('page', function () {
		let page = this.get('page');
		return `discard-edits-dialog-${page.id}`;
	}),
	contentLinkerButtonId: Ember.computed('page', function () {
		let page = this.get('page');
		return `content-linker-button-${page.id}`;
	}),
	previewButtonId: Ember.computed('page', function () {
		let page = this.get('page');
		return `content-preview-button-${page.id}`;
	}),

	didRender() {
		let msContainer = document.getElementById(this.get('containerId'));
		let mousetrap = this.get('mousetrap');

		if (is.null(mousetrap)) {
			mousetrap = new Mousetrap(msContainer);
		}

		mousetrap.bind('esc', () => {
			this.send('onCancel');
			return false;
		});
		mousetrap.bind(['ctrl+s', 'command+s'], () => {
			this.send('onAction');
			return false;
		});

		this.set('mousetrap', mousetrap);

		$('#' + this.get('pageId')).focus(function() {
			$(this).select();
		});
	},

	willDestroyElement() {
		let drop = this.get('drop');
		if (is.not.null(drop)) {
			drop.destroy();
		}

		let mousetrap = this.get('mousetrap');
		if (is.not.null(mousetrap)) {
			mousetrap.unbind('esc');
			mousetrap.unbind(['ctrl+s', 'command+s']);
		}
	},

	actions: {
		onCancel() {
			if (this.attrs.isDirty() !== null && this.attrs.isDirty()) {
				$('#' + this.get('dialogId')).css("display", "block");

				let drop = new Drop({
					target: $('#' + this.get('cancelId'))[0],
					content: $('#' + this.get('dialogId'))[0],
					classes: 'drop-theme-basic',
					position: "bottom right",
					openOn: "always",
					constrainToWindow: true,
					constrainToScrollParent: false,
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
			if (this.get('busy') || is.empty(this.get('page.title'))) {
				return;
			}

			if (this.get('isDestroyed') || this.get('isDestroying')) {
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
		},

		onInsertLink(selection) {
			return this.get('onInsertLink')(selection);
		},		

		onPreview() {
			return this.get('onPreview')();
		},		
	}
});
