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
import Modals from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(Modals, {
	labelName: '',
	labelColor: '#263238',
	editLabel: null,
	deleteLabel: null,
	showDeleteDialog: false,

	actions: {
		onShowAddModal() {
			this.set('labelName', '');
			this.set('labelColor', '');
			this.modalOpen("#add-label-modal", {"show": true}, '#add-label-name');
		},

		onShowDeleteModal(label) {
			this.set('deleteLabel', label);
			this.set('showDeleteDialog', !this.get('showDeleteDialog'));
		},

		onShowUpdateModal(label) {
			this.set('editLabel', label);
			this.set('labelName', label.get('name'));
			this.set('labelColor', label.get('color'));
			this.modalOpen("#edit-label-modal", {"show": true}, '#edit-label-name');
		},

		onSetColor(color) {
			this.set('labelColor', color);
		},

		onAdd() {
			let label = {
				name: this.get('labelName').trim(),
				color: this.get('labelColor').trim(),
			}

			if (label.color === '') {
				label.color = '#263238';
			}

			if (_.isEmpty(label.name)) {
				$('#add-label-name').addClass('is-invalid').focus();
				return;
			}

			$('#add-label-name').removeClass('is-invalid');
			this.modalClose('#add-label-modal');

			this.get('onAdd')(label);
		},

		onUpdate() {
			let name = this.get('labelName').trim();
			let color = this.get('labelColor').trim();
			let label = this.get('editLabel');

			if (_.isEmpty(name)) {
				$('#edit-label-name').addClass('is-invalid').focus();
				return;
			}

			$('#edit-label-name').removeClass('is-invalid');
			this.modalClose('#edit-label-modal');

			label.set('name', name);
			label.set('color', color);

			this.get('onUpdate')(label);

			this.set('editLabel', null);
		},

		onDelete() {
			let label = this.get('deleteLabel');

			this.set('showDeleteDialog', false);
			this.get('onDelete')(label.get('id'));
			this.set('deleteLabel', null);

			return true;
		}
	}
});
