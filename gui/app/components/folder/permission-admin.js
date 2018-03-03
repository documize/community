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

import { inject as service } from '@ember/service';
import { A } from "@ember/array"
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(ModalMixin, {
	groupSvc: service('group'),
	spaceSvc: service('folder'),
	userSvc: service('user'),
	appMeta: service(), 
	store: service(),
	spacePermissions: null,

	didReceiveAttrs() {
		let spacePermissions = A([]);
		let constants = this.get('constants');

		// get groups
		this.get('groupSvc').getAll().then((groups) => {
			this.set('groups', groups);

			groups.forEach((g) => {
				let pr = this.permissionRecord(constants.WhoType.Group, g.get('id'), g.get('name'));
				spacePermissions.pushObject(pr);
			});

			// get space permissions
			this.get('spaceSvc').getPermissions(this.get('folder.id')).then((permissions) => {
				permissions.forEach((perm, index) => { // eslint-disable-line no-unused-vars
					// is this permission for group or user?
					if (perm.get('who') === constants.WhoType.Group) {
						// group permission
						spacePermissions.forEach((sp) => {
							if (sp.get('whoId') == perm.get('whoId')) {
								sp.setProperties(perm);
							}
						});
					} else {
						// user permission
						spacePermissions.pushObject(perm);
					}
				});

				this.set('spacePermissions', spacePermissions.sortBy('who', 'name'));
			});
		});
	},

	permissionRecord(who, whoId, name) {
		let raw = {
			id: whoId,
			orgId: this.get('folder.orgId'),
			folderId: this.get('folder.id'),
			whoId: whoId,
			who: who,
			name: name,
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

		let rec = this.get('store').normalize('space-permission', raw);
		return this.get('store').push(rec);
	},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.get('folder.name') + " space (in " + this.get("appMeta.title") + ") with you so we can both collaborate on documents.";
	},

	actions: {
		setPermissions() {
			let message = this.getDefaultInvitationMessage();
			let permissions = this.get('spacePermissions');
			let folder = this.get('folder');
			let payload = { Message: message, Permissions: permissions };
			let constants = this.get('constants');

			let hasEveryone = _.find(permissions, (permission) => {
				return permission.get('whoId') === constants.EveryoneUserId &&
					(permission.get('spaceView') || permission.get('documentAdd') || permission.get('documentEdit') || permission.get('documentDelete') ||
					permission.get('documentMove') || permission.get('documentCopy') || permission.get('documentTemplate') || permission.get('documentApprove'));
			});

			// see if more than oen user is granted access to space (excluding everyone)
			let roleCount = 0;
			permissions.forEach((permission) => {
				if (permission.get('whoId') !== constants.EveryoneUserId &&
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

			this.get('spaceSvc').savePermissions(folder.get('id'), payload).then(() => {
				this.modalClose('#space-permission-modal');
			});
		}
	}
});
