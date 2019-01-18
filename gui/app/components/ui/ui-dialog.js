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
import Component from '@ember/component';
import stringUtil from '../../utils/string';

export default Component.extend({
	contentId: '',
	cancelCaption: 'Cancel',
	confirmCaption: 'OK',
	title: 'Confirm',
	show: false,
	size: '', // modal-lg, modal-sm

	didInsertElement() {
		this._super(...arguments);
		this.set("contentId", 'confirm-modal-' + stringUtil.makeId(10));
	},

	didUpdateAttrs() {
		this._super(...arguments);
		let modalId = '#' + this.get('contentId');

		if (this.get('show')) {
			$(modalId).modal({});
			$(modalId).modal('show');
			let self = this;
			$(modalId).on('hidden.bs.modal', function(e) { // eslint-disable-line no-unused-vars
				self.set('show', false);
				$(modalId).modal('dispose');
			});
		} else {
			$(modalId).modal('hide');
			$(modalId).modal('dispose');
		}
	},

	actions: {
		onCancel() {
			$('#' + this.get('contentId')).modal('dispose');
		},

		onAction(e) {
			e.preventDefault();

			if (this.get('onAction') === null) {
				return;
			}

			let cb = this.get('onAction');
			let result = cb();
			if (result) {
				this.set('show', false);
			}
		}
	}
});
