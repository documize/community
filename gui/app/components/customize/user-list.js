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
import { schedule, debounce } from '@ember/runloop';
import TooltipMixin from '../../mixins/tooltip';
import AuthProvider from '../../mixins/auth';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(AuthProvider, ModalMixin, TooltipMixin, {
	groupSvc: service('group'),
	editUser: null,
	deleteUser: null,
	filter: '',
	hasSelectedUsers: false,
	showDeleteDialog: false,

	init() {
		this._super(...arguments);
		this.password = {};
		this.selectedUsers = [];
	},

	didReceiveAttrs() {
		this._super(...arguments);

		this.get('groupSvc').getAll().then((groups) => {
			this.set('groups', groups);
		});

		let users = this.get('users');

		users.forEach(user => {
			user.set('me', user.get('id') === this.get('session.session.authenticated.user.id'));
			user.set('selected', false);
		});

		this.set('users', users);

		this.renderTooltips();
	},

	willDestroyElement() {
		this._super(...arguments);
		this.removeTooltips();
	},

	onKeywordChange: function () {
		debounce(this, this.filterUsers, 350);
	}.observes('filter'),

	filterUsers() {
		this.get('onFilter')(this.get('filter'));
	},

	actions: {
		toggleSelect(user) {
			user.set('selected', !user.get('selected'));

			let su = this.get('selectedUsers');
			if (user.get('selected')) {
				su.push(user.get('id'));
			} else {
				su = _.reject(su, function(id){ return id === user.get('id') });
			}

			this.set('selectedUsers', su);
			this.set('hasSelectedUsers', su.length > 0);
		},

		toggleActive(id) {
			let user = this.users.findBy("id", id);
			user.set('active', !user.get('active'));
			let cb = this.get('onSave');
			cb(user);
		},

		toggleEditor(id) {
			let user = this.users.findBy("id", id);
			user.set('editor', !user.get('editor'));
			let cb = this.get('onSave');
			cb(user);
		},

		toggleAdmin(id) {
			let user = this.users.findBy("id", id);
			user.set('admin', !user.get('admin'));
			let cb = this.get('onSave');
			cb(user);
		},

		toggleAnalytics(id) {
			let user = this.users.findBy("id", id);
			user.set('analytics', !user.get('analytics'));
			let cb = this.get('onSave');
			cb(user);
		},

		toggleUsers(id) {
			let user = this.users.findBy("id", id);
			user.set('viewUsers', !user.get('viewUsers'));
			let cb = this.get('onSave');
			cb(user);
		},

		onShowEdit(id) {
			let user = this.users.findBy("id", id);
			let userCopy = user.getProperties('id', 'created', 'revised', 'firstname', 'lastname', 'email', 'initials', 'active', 'editor', 'admin', 'viewUsers', 'accounts');

			this.set('editUser', userCopy);
			this.set('password', {
				password: "",
				confirmation: ""
			});

			$('#edit-user-modal').on('show.bs.modal', function(event) { // eslint-disable-line no-unused-vars
				schedule('afterRender', () => {
					$("#edit-firstname").focus();
				});
			});

			$('#edit-user-modal').modal('dispose');
			$('#edit-user-modal').modal({show: true});
		},

		onUpdate() {
			let user = this.get('editUser');
			let password = this.get('password');

			if (is.empty(user.firstname)) {
				$("#edit-firstname").addClass("is-invalid").focus();
				return;
			}
			if (is.empty(user.lastname)) {
				$("#edit-lastname").addClass("is-invalid").focus();
				return;
			}
			if (is.empty(user.email) || is.not.email(user.email)) {
				$("#edit-email").addClass("is-invalid").focus();
				return;
			}

			$('#edit-user-modal').modal('hide');
			$('#edit-user-modal').modal('dispose');

			let cb = this.get('onSave');
			cb(user);

			if (is.not.empty(password.password) && is.not.empty(password.confirmation) &&
				password.password === password.confirmation) {

				let pw = this.get('onPassword');
				pw(user, password.password);
			}
		},

		onShowDelete(id) {
			this.set('deleteUser', this.users.findBy("id", id));
			this.set('showDeleteDialog', true);
		},

		onDelete() {
			this.set('showDeleteDialog', false);

			this.set('selectedUsers', []);
			this.set('hasSelectedUsers', false);

			let cb = this.get('onDelete');
			cb(this.get('deleteUser.id'));

			return true;
		},

		onBulkDelete() {
			let su = this.get('selectedUsers');

			su.forEach(userId => {
				let cb = this.get('onDelete');
				cb(userId);
			});

			this.set('selectedUsers', []);
			this.set('hasSelectedUsers', false);

			this.modalClose('#admin-user-delete-modal');
		},

		onShowGroupsModal(userId) {
			let user = this.get('users').findBy('id', userId);
			this.set('selectedUser', user);

			let userGroups = user.get('groups');

			// mark up groups user belongs to...
			let groups = this.get('groups');
			groups.forEach((g) => {
				let hasGroup = userGroups.findBy('roleId', g.get('id'));
				g.set('isMember', is.not.undefined(hasGroup));
			})
			this.set('groups', groups);

			this.modalOpen("#group-member-modal", {"show": true});
		},

		onLeaveGroup(groupId) {
			let userId = this.get('selectedUser.id');
			let group = this.get('groups').findBy('id', groupId);
			group.set('isMember', false);

			if (is.undefined(groupId) || is.undefined(userId)) {
				return;
			}

			this.get('groupSvc').leave(groupId, userId).then(() => {
				this.filterUsers();
			});
		},

		onJoinGroup(groupId) {
			let userId = this.get('selectedUser.id');
			let group = this.get('groups').findBy('id', groupId);
			group.set('isMember', true);

			if (is.undefined(groupId) || is.undefined(userId)) {
				return;
			}

			this.get('groupSvc').join(groupId, userId).then(() => {
				this.filterUsers();
			});
		},

		onSyncKeycloak() {
			this.get('onSyncKeycloak')();
		},

		onSyncLDAP() {
			this.get('onSyncLDAP')();
		},

		onLimit(limit) {
			this.set('userLimit', limit);
			this.filterUsers();
		}
	}
});
