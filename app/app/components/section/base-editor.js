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

export default Ember.Component.extend({
	drop: null,
	cancelLabel: "Close",
	actionLabel: "Save",
	tip: "Short and concise title",
	busy: false,
	hasExcerpt: Ember.computed('page', function () {
		return is.not.undefined(this.get('page.excerpt'));
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

		$("#page-title").removeClass("error");
		$("#page-excerpt").removeClass("error");

		$("#page-title").focus(function() {
			$(this).select();
		});
		$("#page-excerpt").focus(function() {
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

				let drop = new Drop({
					target: $("#editor-cancel")[0],
					content: $(".cancel-edits-dialog")[0],
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
				$("#page-title").addClass("error").focus();
				return;
			}

			if (this.get('hasExcerpt') && is.empty(this.get('page.excerpt'))) {
				$("#page-excerpt").addClass("error").focus();
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
