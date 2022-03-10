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

import $ from 'jquery';
import { empty } from '@ember/object/computed';
import { computed } from '@ember/object';
import Modals from '../../mixins/modal';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Modals, Notifier, {
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
	previewIcon: computed('previewIcon', function () {
		let constants = this.get('constants');
		return constants.Icon.Preview;
	}),
	pageTitle: '',

	didReceiveAttrs() {
		this._super();
		this.set('pageTitle', this.get('page.title'));
	},

	didRender() {
		this._super(...arguments);

		let msContainer = document.getElementById('section-editor-' + this.get('containerId'));
		let mousetrap = this.get('mousetrap');
		if (_.isNull(mousetrap)) {
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
		this._super(...arguments);
		this.set('showLinkModal', false);

		let mousetrap = this.get('mousetrap');
		if (!_.isNull(mousetrap)) {
			mousetrap.unbind('esc');
			mousetrap.unbind(['ctrl+s', 'command+s']);
		}
	},

	actions: {
		onAction() {
			if (this.get('busy') || _.isEmpty(this.get('pageTitle'))) {
				return;
			}

			if (this.get('isDestroyed') || this.get('isDestroying')) {
				return;
			}

			let cb = this.get('onAction');
			cb(this.get('pageTitle'));
		},

		onCancel() {
			let isDirty = this.get('isDirty');
			if (isDirty() !== null && isDirty()) {
				this.modalOpen('#discard-modal-' + this.get('page.id'), {show: true});
				return;
			}

			let cb = this.get('onCancel');
			cb();
		},

		onDiscard() {
			this.modalClose('#discard-modal-' + this.get('page.id'));
			let cb = this.get('onCancel');
			cb();
		},

		onPreview() {
			let constants = this.get('constants');
			let pt = this.get('previewText');
			this.set('previewText', pt === 'Preview' ? 'Edit Mode' : 'Preview');
			this.set('previewIcon', pt === 'Preview' ? constants.Icon.Edit : constants.Icon.Preview);
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
