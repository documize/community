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
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	documentService: service('document'),
	editMode: false,
	docName: '',
	docExcerpt: '',
	hasNameError: empty('docName'),
	hasExcerptError: empty('docExcerpt'),

	canEdit: computed('permssions', 'document', function() {
		let constants = this.get('constants');
		let permissions = this.get('permissions');

		if (permissions.get('documentEdit') && this.get('document.protection') === constants.ProtectionType.None) {
			return true;
		} else if (permissions.get('documentApprove') && this.get('document.protection') === constants.ProtectionType.Review) {
			return true;
		}

		return false;
	}),

	keyUp(e) {
		if (e.keyCode === 27) { // escape key
			this.send('onCancel');
		}
	},

	actions: {
		toggleEdit() {
			this.set('docName', this.get('document.name'));
			this.set('docExcerpt', this.get('document.excerpt'));
			this.set('editMode', true);

			schedule('afterRender', () => {
				$('#document-name').select();
			});
		},

		onSave() {
			if (this.get('hasNameError') || this.get('hasExcerptError')) {
				return;
			}

			this.set('document.name', this.get('docName'));
			this.set('document.excerpt', this.get('docExcerpt'));
			this.set('editMode', false);

			let cb = this.get('onSaveDocument');
			cb(this.get('document'));
		},

		onCancel() {
			this.set('editMode', false);
		}
	}
});
