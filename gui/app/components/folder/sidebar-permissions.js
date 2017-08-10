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

			var folderPermissions = [];

			users.forEach((user) => {
				let isActive = user.get('active');

				let u = {
					userId: user.get('id'),
					fullname: user.get('fullname'),
					orgId: this.get('folder.orgId'),
					folderId: this.get('folder.id'),
					canEdit: false,
					canView: false,
					canViewPrevious: false
				};

				if (isActive) {
					folderPermissions.pushObject(u);
				}
			});

			var u = {
				userId: "",
				fullname: " Everyone",
				orgId: this.get('folder.orgId'),
				folderId: this.get('folder.id'),
				canEdit: false,
				canView: false
			};

			folderPermissions.pushObject(u);

			this.get('folderService').getPermissions(this.get('folder.id')).then((permissions) => {
				permissions.forEach((permission, index) => { // eslint-disable-line no-unused-vars
					var folderPermission = folderPermissions.findBy('userId', permission.get('userId'));
					if (is.not.undefined(folderPermission)) {
						Ember.setProperties(folderPermission, {
							orgId: permission.get('orgId'),
							folderId: permission.get('folderId'),
							canEdit: permission.get('canEdit'),
							canView: permission.get('canView'),
							canViewPrevious: permission.get('canView')
						});
					}
				});

				folderPermissions.map((permission) => {
					let data = this.get('store').normalize('folder-permission', permission);
					return this.get('store').push(data);
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
			let folder = this.get('folder');
			let permissions = this.get('permissions');

			this.get('permissions').forEach((permission, index) => { // eslint-disable-line no-unused-vars
				Ember.set(permission, 'canView', $("#canView-" + permission.userId).prop('checked'));
				Ember.set(permission, 'canEdit', $("#canEdit-" + permission.userId).prop('checked'));
			});

			var data = permissions.map((obj) => {
				let permission = {
					'orgId': obj.orgId,
					'folderId': obj.folderId,
					'userId': obj.userId,
					'canEdit': obj.canEdit,
					'canView': obj.canView
				};

				return permission;
			});

			var payload = { Message: message, Roles: data };

			this.get('folderService').savePermissions(folder.get('id'), payload).then(() => {
			});

			var hasEveryone = _.find(data, function (permission) {
				return permission.userId === "" && (permission.canView || permission.canEdit);
			});

			if (is.not.undefined(hasEveryone)) {
				folder.markAsPublic();
			} else {
				if (data.length > 1) {
					folder.markAsRestricted();
				} else {
					folder.markAsPrivate();
				}
			}

			this.get('folderService').save(folder).then(function () {
				// window.location.href = "/folder/" + folder.get('id') + "/" + folder.get('slug');
			});
		}
	}
});
