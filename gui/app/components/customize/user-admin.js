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

import { debounce } from '@ember/runloop';

import Component from '@ember/component';
import AuthProvider from '../../mixins/auth';
import DropdownMixin from '../../mixins/dropdown';

export default Component.extend(AuthProvider, DropdownMixin, {
	editUser: null,
	deleteUser: null,
	dropdown: null,
	password: {},
	filter: '',
	filteredUsers: [],
	selectedUsers: [],
	hasSelectedUsers: false,

	didReceiveAttrs() {
		this._super(...arguments);

		let users = this.get('users');

		users.forEach(user => {
			user.set('me', user.get('id') === this.get('session.session.authenticated.user.id'));
			user.set('selected', false);
		});

		this.set('users', users);
		this.set('filteredUsers', users);
	},

	willDestroyElement() {
		this._super(...arguments);
		this.destroyDropdown();
	},

	onKeywordChange: function () {
		debounce(this, this.filterUsers, 350);
	}.observes('filter'),

	filterUsers() {
		let users = this.get('users');
		let filteredUsers = [];
		let filter = this.get('filter').toLowerCase();

		users.forEach(user => {
			if (user.get('fullname').toLowerCase().includes(filter) || user.get('email').toLowerCase().includes(filter)) {
				filteredUsers.pushObject(user);
			}
		});

		this.set('filteredUsers', filteredUsers);
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
			this.attrs.onSave(user);
		},

		toggleEditor(id) {
			let user = this.users.findBy("id", id);
			user.set('editor', !user.get('editor'));
			this.attrs.onSave(user);
		},

		toggleAdmin(id) {
			let user = this.users.findBy("id", id);
			user.set('admin', !user.get('admin'));
			this.attrs.onSave(user);
		},

		toggleUsers(id) {
			let user = this.users.findBy("id", id);
			user.set('viewUsers', !user.get('viewUsers'));
			this.attrs.onSave(user);
		},

		edit(id) {
			let self = this;

			let user = this.users.findBy("id", id);
			let userCopy = user.getProperties('id', 'created', 'revised', 'firstname', 'lastname', 'email', 'initials', 'active', 'editor', 'admin', 'viewUsers', 'accounts');
			this.set('editUser', userCopy);
			this.set('password', {
				password: "",
				confirmation: ""
			});
			$(".edit-user-dialog").css("display", "block");
			$("input").removeClass("error");

			this.closeDropdown();

			let dropOptions = Object.assign(this.get('dropDefaults'), {
				target: $(".edit-button-" + id)[0],
				content: $(".edit-user-dialog")[0],
				classes: 'drop-theme-basic',
				position: "bottom right",
				remove: false});

			let drop = new Drop(dropOptions);
			self.set('dropdown', drop);

			drop.on('open', function () {
				self.$("#edit-firstname").focus();
			});
		},

		confirmDelete(id) {
			let user = this.users.findBy("id", id);
			this.set('deleteUser', user);
			$(".delete-user-dialog").css("display", "block");

			this.closeDropdown();

			let dropOptions = Object.assign(this.get('dropDefaults'), {
				target: $(".delete-button-" + id)[0],
				content: $(".delete-user-dialog")[0],
				classes: 'drop-theme-basic',
				position: "bottom right",
				remove: false});

			let drop = new Drop(dropOptions);
			this.set('dropdown', drop);
		},

		cancel() {
			this.closeDropdown();
		},

		save() {
			let user = this.get('editUser');
			let password = this.get('password');

			if (is.empty(user.firstname)) {
				$("#edit-firstname").addClass("error").focus();
				return;
			}
			if (is.empty(user.lastname)) {
				$("#edit-lastname").addClass("error").focus();
				return;
			}
			if (is.empty(user.email)) {
				$("#edit-email").addClass("error").focus();
				return;
			}

			this.closeDropdown();

			this.attrs.onSave(user);

			if (is.not.empty(password.password) && is.not.empty(password.confirmation) &&
				password.password === password.confirmation) {
				this.attrs.onPassword(user, password.password);
			}
		},

		delete() {
			this.closeDropdown();

			this.set('selectedUsers', []);
			this.set('hasSelectedUsers', false);
			this.attrs.onDelete(this.get('deleteUser.id'));
		},

		onBulkDelete() {
			let su = this.get('selectedUsers');

			su.forEach(userId => {
				this.attrs.onDelete(userId);
			});

			this.set('selectedUsers', []);
			this.set('hasSelectedUsers', false);

			return true;
		}
	}
});
