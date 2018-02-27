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
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import AuthProvider from '../../mixins/auth';
import ModalMixin from '../../mixins/modal';

export default Component.extend(AuthProvider, ModalMixin, {
	groupSvc: service('group'),
	newGroup: null,

	didReceiveAttrs() {
		this._super(...arguments);
		this.load();
		this.setDefaults();
	},

	load() {
		this.get('groupSvc').getAll().then((groups) => {
			this.set('groups', groups);
		});
	},

	setDefaults() {
		this.set('newGroup', { name: '', purpose: '' });
	},

	actions: {
		onOpenGroupModal() {
			this.modalOpen("#add-group-modal", {"show": true}, '#new-group-name');
		},

		onAddGroup(e) {
			e.preventDefault();

			let newGroup = this.get('newGroup');
			if (is.empty(newGroup.name)) {
				$("#new-group-name").addClass("is-invalid").focus();
				return;
			}

			this.get('groupSvc').add(newGroup).then(() => {
				this.load();
			});

			this.modalClose("#add-group-modal");
			this.setDefaults();
		},

		onShowDeleteModal(groupId) {
			this.set('deleteGroup', { name: '', id: groupId });
			this.modalOpen("#delete-group-modal", {"show": true}, '#delete-group-name');
		},

		onDeleteGroup(e) {
			e.preventDefault();

			let deleteGroup = this.get('deleteGroup');
			let group = this.get('groups').findBy('id', deleteGroup.id);

			if (is.empty(deleteGroup.name) || group.get('name') !== deleteGroup.name) {
				$("#delete-group-name").addClass("is-invalid").focus();
				return;
			}

			this.get('groupSvc').delete(deleteGroup.id).then(() => {
				this.load();
			});

			this.modalClose("#delete-group-modal");
			this.set('deleteGroup', { name: '', id: '' });
		},

		onShowEditModal(groupId) {
			let group = this.get('groups').findBy('id', groupId);
			this.set('editGroup', group);
			this.modalOpen("#edit-group-modal", {"show": true}, '#edit-group-name');
		},

		onEditGroup(e) {
			e.preventDefault();

			let group = this.get('editGroup');

			if (is.empty(group.get('name'))) {
				$("#edit-group-name").addClass("is-invalid").focus();
				return;
			}

			this.get('groupSvc').update(group).then(() => {
				this.load();
			});

			this.modalClose("#edit-group-modal");
			this.set('editGroup', null);
		}
	}
});
