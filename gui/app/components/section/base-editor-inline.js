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
import { computed } from '@ember/object';
import TooltipMixin from '../../mixins/tooltip';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(TooltipMixin, ModalMixin, {
	busy: false,
	mousetrap: null,
	showLinkModal: false,
	hasNameError: empty('page.title'),
	hasDescError: empty('page.excerpt'),
	pageId: computed('page', function () {
		let page = this.get('page');
		return `page-editor-${page.id}`;
	}),
	previewText: 'Preview',

	didRender() {
		let msContainer = document.getElementById('section-editor-' + this.get('containerId'));
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

		this.renderTooltips();
	},

	willDestroyElement() {
		this._super(...arguments);

		this.removeTooltips();

		let mousetrap = this.get('mousetrap');
		if (is.not.null(mousetrap)) {
			mousetrap.unbind('esc');
			mousetrap.unbind(['ctrl+s', 'command+s']);
		}
	},

	actions: {
		onAction() {
			if (this.get('busy') || is.empty(this.get('page.title'))) {
				return;
			}

			if (this.get('isDestroyed') || this.get('isDestroying')) {
				return;
			}

			this.attrs.onAction(this.get('page.title'));
		},

		onCancel() {
			if (this.attrs.isDirty() !== null && this.attrs.isDirty()) {
				this.modalOpen('#discard-modal-' + this.get('page.id'), {show: true});
				return;
			}

			this.attrs.onCancel();
		},

		onDiscard() {
			this.modalClose('#discard-modal-' + this.get('page.id'));
			this.attrs.onCancel();
		},

		onPreview() {
			let pt = this.get('previewText');
			this.set('previewText', pt === 'Preview' ? 'Edit Mode' : 'Preview');
			return this.get('onPreview')();
		},

		onShowLinkModal() {
			this.set('showLinkModal', true);
		},

		onInsertLink(selection) {
			this.set('showLinkModal', false);
			return this.get('onInsertLink')(selection);
		}
	}
});
