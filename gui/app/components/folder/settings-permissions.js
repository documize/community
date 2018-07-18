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
import { A } from '@ember/array';
import { debounce } from '@ember/runloop';
import { computed } from '@ember/object';
import Notifier from '../../mixins/notifier';
import Modals from '../../mixins/modal';
import stringUtil from '../../utils/string';
import Component from '@ember/component';

export default Component.extend(Notifier, Modals, {
	groupSvc: service('group'),
	spaceSvc: service('folder'),
	userSvc: service('user'),
	router: service(),
	appMeta: service(),
	store: service(),
	spacePermissions: null,
	users: null,
	searchText: '',
	inviteEmail: '',
	inviteMessage: '',

	isSpaceAdmin: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('searchText', '');

		if (this.get('inviteMessage').length === 0) {
			this.set('inviteMessage', this.getDefaultInvitationMessage());
		}

		this.load();
	},

	load() {
		let spacePermissions = A([]);
		let constants = this.get('constants');

		// get groups
		this.get('groupSvc').getAll().then((groups) => {
			this.set('groups', groups);

			groups.forEach((g) => {
				let pr = this.permissionRecord(constants.WhoType.Group, g.get('id'), g.get('name'));
				pr.set('members', g.get('members'));
				spacePermissions.pushObject(pr);
			});

			let hasEveryoneId = false;

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
						if (perm.get('whoId') === constants.EveryoneUserId) {
							perm.set('name', ' ' + perm.get('name'));
							hasEveryoneId = true;
						}
						spacePermissions.pushObject(perm);
					}
				});

				// always show everyone
				if (!hasEveryoneId) {
					let pr = this.permissionRecord(constants.WhoType.User, constants.EveryoneUserId, ' ' + constants.EveryoneUserName);
					spacePermissions.pushObject(pr);
				}

				this.set('spacePermissions', spacePermissions.sortBy('who', 'name'));
			});
		});
	},

	permissionRecord(who, whoId, name) {
		let raw = {
			id: stringUtil.makeId(16),
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
			documentLifecycle: false,
			documentVersion: false,
		};

		let rec = this.get('store').normalize('space-permission', raw);
		return this.get('store').push(rec);
	},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.get('folder.name') + " space (in " + this.get("appMeta.title") + ") with you so we can both collaborate on documents.";
	},

	matchUsers(s) {
		let spacePermissions = this.get('spacePermissions');
		let filteredUsers = A([]);

		this.showWait();

		this.get('userSvc').matchUsers(s).then((users) => {
			users.forEach((user) => {
				let exists = spacePermissions.findBy('whoId', user.get('id'));

				if (is.undefined(exists)) {
					filteredUsers.pushObject(user);
				}
			});

			this.set('filteredUsers', filteredUsers);
			this.showDone();
		});
	},

	actions: {
		onShowInviteModal() {
			this.modalOpen("#space-invite-user-modal", {"show": true}, '#space-invite-email');
		},

		onShowAddModal() {
			this.modalOpen("#space-add-user-modal", {"show": true}, '#user-search');
		},

		onSave() {
			if (!this.get('isSpaceAdmin')) return;

			this.showWait();

			let message = this.getDefaultInvitationMessage();
			let permissions = this.get('spacePermissions');
			let folder = this.get('folder');
			let payload = { Message: message, Permissions: permissions };
			let constants = this.get('constants');

			let hasEveryone = _.find(permissions, (permission) => {
				return permission.get('whoId') === constants.EveryoneUserId &&
					(permission.get('spaceView') || permission.get('documentAdd') || permission.get('documentEdit') || permission.get('documentDelete') ||
						permission.get('documentMove') || permission.get('documentCopy') || permission.get('documentTemplate') ||
						permission.get('documentApprove') || permission.get('documentLifecycle') || permission.get('documentVersion'));
			});

			// see if more than oen user is granted access to space (excluding everyone)
			let roleCount = 0;
			permissions.forEach((permission) => {
				if (permission.get('whoId') !== constants.EveryoneUserId &&
					(permission.get('spaceView') || permission.get('documentAdd') || permission.get('documentEdit') || permission.get('documentDelete') ||
						permission.get('documentMove') || permission.get('documentCopy') || permission.get('documentTemplate') ||
						permission.get('documentApprove') || permission.get('documentLifecycle') || permission.get('documentVersion'))) {
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
				this.showDone();
				this.get('onRefresh')();
			});
		},

		onSearch() {
			debounce(this, function () {
				let searchText = this.get('searchText').trim();

				if (searchText.length === 0) {
					this.set('filteredUsers', A([]));
					return;
				}

				this.matchUsers(searchText);
			}, 250);
		},

		onAdd(user) {
			let spacePermissions = this.get('spacePermissions');
			let constants = this.get('constants');

			this.showWait();

			let exists = spacePermissions.findBy('whoId', user.get('id'));

			if (is.undefined(exists)) {
				spacePermissions.pushObject(this.permissionRecord(constants.WhoType.User, user.get('id'), user.get('fullname')));
				this.set('spacePermissions', spacePermissions);
				this.send('onSearch');
			}

			this.showDone();
		},

		onSpaceInvite(e) {
			e.preventDefault();

			var email = this.get('inviteEmail').trim().replace(/ /g, '');
			var message = this.get('inviteMessage').trim();

			if (message.length === 0) {
				this.set('inviteMessage', this.getDefaultInvitationMessage());
				message = this.getDefaultInvitationMessage();
			}

			if (email.length === 0) {
				this.$('#space-invite-email').addClass('is-invalid').focus();
				return;
			}

			this.showWait();

			var result = {
				Message: message,
				Recipients: []
			};

			// Check for multiple email addresses
			if (email.indexOf(",") > -1) {
				result.Recipients = email.split(',');
			}
			if (email.indexOf(";") > -1 && result.Recipients.length === 0) {
				result.Recipients = email.split(';');
			}

			// Handle just one email address
			if (result.Recipients.length === 0 && email.length > 0) {
				result.Recipients.push(email);
			}

			this.set('inviteEmail', '');

			this.get('spaceSvc').share(this.get('folder.id'), result).then(() => {
				this.showDone();
				this.$('#space-invite-email').removeClass('is-invalid');
				this.modalClose("#space-invite-user-modal");
				this.load();
			});
		},

		onBulkPermission(p, state) {
			p.set('spaceView', state);
			p.set('spaceManage', state);
			p.set('spaceOwner', state);
			p.set('documentAdd', state);
			p.set('documentEdit', state);
			p.set('documentDelete', state);
			p.set('documentMove', state);
			p.set('documentCopy', state);
			p.set('documentTemplate', state);
			p.set('documentApprove', state);
			p.set('documentLifecycle', state);
			p.set('documentVersion', state);
		}
	}
});
