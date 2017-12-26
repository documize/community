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

import { setProperties } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ModalMixin from '../../mixins/modal';

export default Component.extend(ModalMixin, {
	folderService: service('folder'),
	userService: service('user'),
	appMeta: service(),
	store: service(),

	didReceiveAttrs() {
		this.get('userService').getSpaceUsers(this.get('folder.id')).then((users) => {
			this.set('users', users);

			// set up users
			let folderPermissions = [];

			users.forEach((user) => {
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
					documentTemplate: false,
					documentApprove: false,
				};

				let data = this.get('store').normalize('space-permission', u)
				folderPermissions.pushObject(this.get('store').push(data));
			});

			// set up Everyone user
			let u = {
				orgId: this.get('folder.orgId'),
				folderId: this.get('folder.id'),
				userId: '0',
				fullname: ' Everyone',
				spaceView: false,
				spaceManage: false,
				spaceOwner: false,
				documentAdd: false,
				documentEdit: false,
				documentDelete: false,
				documentMove: false,
				documentCopy: false,
				documentTemplate: false,
				documentApprove: false,
		};

			let data = this.get('store').normalize('space-permission', u)
			folderPermissions.pushObject(this.get('store').push(data));

			this.get('folderService').getPermissions(this.get('folder.id')).then((permissions) => {
				permissions.forEach((permission, index) => { // eslint-disable-line no-unused-vars
					let record = folderPermissions.findBy('userId', permission.get('userId'));
					if (is.not.undefined(record)) {
						record = setProperties(record, permission);
					}
				});

				this.set('permissions', folderPermissions.sortBy('fullname'));
			});
		});
	},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.get('folder.name') + " space (in " + this.get("appMeta.title") + ") with you so we can both collaborate on documents.";
	},

	actions: {
		setPermissions() {
			let message = this.getDefaultInvitationMessage();
			let permissions = this.get('permissions');
			let folder = this.get('folder');
			let payload = { Message: message, Permissions: permissions };

			let hasEveryone = _.find(permissions, function (permission) {
				return permission.get('userId') === "0" &&
					(permission.get('spaceView') || permission.get('documentAdd') || permission.get('documentEdit') || permission.get('documentDelete') ||
					permission.get('documentMove') || permission.get('documentCopy') || permission.get('documentTemplate') || permission.get('documentApprove'));
			});

			// see if more than oen user is granted access to space (excluding everyone)
			let roleCount = 0;
			permissions.forEach((permission) => {
				if (permission.get('userId') !== "0" &&
					(permission.get('spaceView') || permission.get('documentAdd') || permission.get('documentEdit') || permission.get('documentDelete') ||
					permission.get('documentMove') || permission.get('documentCopy') || permission.get('documentTemplate') || permission.get('documentApprove'))) {
						roleCount += 1;
				}
			});

			if (is.not.undefined(hasEveryone)) {
				folder.markAsPublic();
			} else {
				if (roleCount > 1) {
					folder.markAsRestricted();
				} else {
					folder.markAsPrivate();
				}
			}

			this.get('folderService').savePermissions(folder.get('id'), payload).then(() => {
				this.modalClose('#space-permission-modal');
			});
		}
	}
});
