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
import { schedule } from '@ember/runloop';
import { notEmpty } from '@ember/object/computed';
import NotifierMixin from '../../mixins/notifier';
import AuthMixin from '../../mixins/auth';

export default Component.extend(NotifierMixin, AuthMixin, {
	spaceName: '',
	copyTemplate: true,
	copyPermission: true,
	copyDocument: false,
	hasClone: notEmpty('clonedSpace.id'),
	clonedSpace: null,

	init() {
		this._super(...arguments);
		// this.clonedSpace = { id: '' };
	},

	didInsertElement() {
		this._super(...arguments);

		$('#add-space-modal').on('show.bs.modal', function(event) { // eslint-disable-line no-unused-vars
			schedule('afterRender', () => {
				$("#new-space-name").focus();
			});
		});
	},

	actions: {
		onCloneSpaceSelect(sp) {
			this.set('clonedSpace', sp)
		},

		onAddSpace(e) {
			e.preventDefault();

			let spaceName = this.get('spaceName');
			let clonedId = this.get('clonedSpace.id');

			if (is.empty(spaceName)) {
				$("#new-space-name").addClass("is-invalid").focus();
				return false;
			}

			let payload = {
				name: spaceName,
				cloneId: clonedId,
				copyTemplate: this.get('copyTemplate'),
				copyPermission: this.get('copyPermission'),
				copyDocument: this.get('copyDocument'),
			}

			this.set('spaceName', '');
			this.set('clonedSpace', null);
			$("#new-space-name").removeClass("is-invalid");
			$('#add-space-modal').modal('hide');
			$('#add-space-modal').modal('dispose');

			let cb = this.get('onAddSpace');
			cb(payload);
		}
	}
});
