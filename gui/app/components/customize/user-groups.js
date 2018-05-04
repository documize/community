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
import { debounce } from '@ember/runloop';
import { A } from '@ember/array';
import Component from '@ember/component';
import AuthProvider from '../../mixins/auth';
import ModalMixin from '../../mixins/modal';

export default Component.extend(AuthProvider, ModalMixin, {
	groupSvc: service('group'),
	userSvc: service('user'),
	newGroup: null,
	searchText: '',
	showUsers: false,
	showMembers: true,
	users: null,
	members: null,

	didReceiveAttrs() {
		this._super(...arguments);
		this.loadGroups();
		this.setDefaults();
	},

	loadGroups() {
		this.get('groupSvc')
			.getAll()
			.then(groups => {
				this.set('groups', groups);
			});
	},

	setDefaults() {
		this.set('newGroup', { name: '', purpose: '' });
	},

	loadGroupInfo() {
		let groupId = this.get('membersGroup.id');
		let searchText = this.get('searchText');

		this.get('groupSvc')
			.getGroupMembers(groupId)
			.then(members => {
				this.set('members', members);

				this.get('userSvc')
					.matchUsers(searchText)
					.then(users => {
						let filteredUsers = A([]);
						users.forEach(user => {
							let m = members.findBy('userId', user.get('id'));
							if (is.undefined(m)) filteredUsers.pushObject(user);
							// user.set('isMember', is.not.undefined(m));
						});

						if (this.get('showMembers') && members.length === 0) {
							this.set('showMembers', false);
							this.set('showUsers', true);
						}

						this.set('users', filteredUsers);
					});
			});
	},

	actions: {
		onOpenGroupModal() {
			this.modalOpen(
				'#add-group-modal',
				{ show: true },
				'#new-group-name'
			);
		},

		onAddGroup(e) {
			e.preventDefault();

			let newGroup = this.get('newGroup');

			if (is.empty(newGroup.name)) {
				$('#new-group-name')
					.addClass('is-invalid')
					.focus();
				return;
			}

			this.get('groupSvc')
				.add(newGroup)
				.then(() => {
					this.loadGroups();
				});

			this.modalClose('#add-group-modal');
			this.setDefaults();
		},

		onShowDeleteModal(groupId) {
			this.set('deleteGroup', { name: '', id: groupId });
			this.modalOpen(
				'#delete-group-modal',
				{ show: true },
				'#delete-group-name'
			);
		},

		onDeleteGroup(e) {
			e.preventDefault();

			let deleteGroup = this.get('deleteGroup');
			let group = this.get('groups').findBy('id', deleteGroup.id);

			if (
				is.empty(deleteGroup.name) ||
				group.get('name') !== deleteGroup.name
			) {
				$('#delete-group-name')
					.addClass('is-invalid')
					.focus();
				return;
			}

			this.get('groupSvc')
				.delete(deleteGroup.id)
				.then(() => {
					this.loadGroups();
				});

			this.modalClose('#delete-group-modal');
			this.set('deleteGroup', { name: '', id: '' });
		},

		onShowEditModal(groupId) {
			this.set('editGroup', this.get('groups').findBy('id', groupId));
			this.modalOpen(
				'#edit-group-modal',
				{ show: true },
				'#edit-group-name'
			);
		},

		onEditGroup(e) {
			e.preventDefault();

			let group = this.get('editGroup');

			if (is.empty(group.get('name'))) {
				$('#edit-group-name')
					.addClass('is-invalid')
					.focus();
				return;
			}

			this.get('groupSvc')
				.update(group)
				.then(() => {
					this.load();
				});

			this.modalClose('#edit-group-modal');
			this.set('editGroup', null);
		},

		onShowMembersModal(groupId) {
			this.set('membersGroup', this.get('groups').findBy('id', groupId));
			this.modalOpen(
				'#group-members-modal',
				{ show: true },
				'#group-members-search'
			);
			this.set('members', null);
			this.set('users', null);
			this.set('showMembers', true);
			this.set('showUsers', false);
			this.set('searchText', '');
			this.loadGroupInfo();
		},

		onSearch() {
			debounce(
				this,
				function() {
					let searchText = this.get('searchText');
					this.loadGroupInfo();

					if (is.not.empty(searchText)) {
						this.set('showMembers', false);
						this.set('showUsers', true);
					} else {
						this.set('showMembers', true);
						this.set('showUsers', false);
					}
				},
				450
			);
		},

		onLeaveGroup(userId) {
			let groupId = this.get('membersGroup.id');

			this.get('groupSvc')
				.leave(groupId, userId)
				.then(() => {
					this.loadGroupInfo();
					this.loadGroups();
				});
		},

		onJoinGroup(userId) {
			let groupId = this.get('membersGroup.id');

			this.get('groupSvc')
				.join(groupId, userId)
				.then(() => {
					this.loadGroupInfo();
					this.loadGroups();
				});
		}
	}
});
