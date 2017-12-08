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

import { empty } from '@ember/object/computed';
import Component from '@ember/component';
import ModalMixin from '../../mixins/modal';

export default Component.extend(ModalMixin, {
	cancelLabel: "Close",
	actionLabel: "Save",
	busy: false,
	hasNameError: empty('page.title'),
	hasDescError: empty('page.excerpt'),

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

		$("#page-title").removeClass("is-invalid");
		$("#page-excerpt").removeClass("is-invalid");

		$("#page-title").focus(function() {
			$(this).select();
		});
		$("#page-excerpt").focus(function() {
			$(this).select();
		});
	},

	actions: {
		onCancel() {
			if (this.attrs.isDirty() !== null && this.attrs.isDirty()) {
				this.modalOpen('#discard-modal', {show: true});
				return;
			}

			this.attrs.onCancel();
		},

		onDiscard() {
			this.modalClose('#discard-modal');
			this.attrs.onCancel();
		},


		onAction() {
			if (this.get('busy')) {
				return;
			}

			if (is.empty(this.get('page.title'))) {
				$("#page-title").addClass("is-invalid").focus();
				return;
			}

			if (this.get('hasExcerpt') && is.empty(this.get('page.excerpt'))) {
				$("#page-excerpt").addClass("is-invalid").focus();
				return;
			}

			this.attrs.onAction(this.get('page.title'));
		}
	}
});
