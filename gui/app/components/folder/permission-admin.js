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

import Ember from 'ember';
import NotifierMixin from '../../mixins/notifier';

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(NotifierMixin, {
	folderService: service('folder'),
	userService: service('user'),
	appMeta: service(),
	store: service(),

	didReceiveAttrs() {
		this.get('userService').getAll().then((users) => {
			this.set('users', users);

			// set up users
			let folderPermissions = [];

			users.forEach((user) => {
				let isActive = user.get('active');

				let u = {
					orgId: this.get('folder.orgId'),
					folderId: this.get('folder.id'),
					userId: user.get('id'),
					fullname: user.get('fullname'),
					spaceView: false,
					spaceManage: false,
					spaceOwner: false,
					documentAdd: false,
					documentEdit: false,
					documentDelete: false,
					documentMove: false,
					documentCopy: false,
					documentTemplate: false
				};

				if (isActive) {
					let data = this.get('store').normalize('space-permission', u)
					folderPermissions.pushObject(this.get('store').push(data));
				}
			});

			// set up Everyone user
			let u = {
				orgId: this.get('folder.orgId'),
				folderId: this.get('folder.id'),
				userId: '',
				fullname: ' Everyone',
				spaceView: false,
				spaceManage: false,
				spaceOwner: false,
				documentAdd: false,
				documentEdit: false,
				documentDelete: false,
				documentMove: false,
				documentCopy: false,
				documentTemplate: false
		};

			let data = this.get('store').normalize('space-permission', u)
			folderPermissions.pushObject(this.get('store').push(data));

			this.get('folderService').getPermissions(this.get('folder.id')).then((permissions) => {
				permissions.forEach((permission, index) => { // eslint-disable-line no-unused-vars
					let user = folderPermissions.findBy('userId', permission.get('userId'));
					if (is.not.undefined(user)) {
						Ember.setProperties(user, permission);
					}
				});

				this.set('permissions', folderPermissions.sortBy('fullname'));
			});
		});
	},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.get('folder.name') + " space (in " + this.get("appMeta.title") + ") with you so we can both access the same documents.";
	},

	actions: {
		setPermissions() {
			let message = this.getDefaultInvitationMessage();
			// let folder = this.get('folder');
			let permissions = this.get('permissions');

			permissions.forEach((permission, index) => { // eslint-disable-line no-unused-vars
				Ember.set(permission, 'spaceView', $("#space-role-view-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'spaceManage', $("#space-role-manage-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'spaceOwner', $("#space-role-owner-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'documentAdd', $("#doc-role-add-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'documentEdit', $("#doc-role-edit-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'documentDelete', $("#doc-role-delete-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'documentMove', $("#doc-role-move-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'documentCopy', $("#doc-role-copy-" + permission.get('userId')).prop('checked'));
				Ember.set(permission, 'documentTemplate', $("#doc-role-template-" + permission.get('userId')).prop('checked'));
			});

			let payload = { Message: message, Permissions: permissions };
			console.log(payload);

			// this.get('folderService').savePermissions(folder.get('id'), payload).then(() => {
			// 	this.showNotification('Saved permissions');
			// });

			// var hasEveryone = _.find(data, function (permission) {
			// 	return permission.userId === "" && (permission.canView || permission.canEdit);
			// });

			// if (is.not.undefined(hasEveryone)) {
			// 	folder.markAsPublic();
			// } else {
			// 	if (data.length > 1) {
			// 		folder.markAsRestricted();
			// 	} else {
			// 		folder.markAsPrivate();
			// 	}
			// }

			// this.get('folderService').save(folder).then(function () {
			// });
		}
	}
});
