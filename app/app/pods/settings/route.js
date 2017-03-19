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

export default Ember.Route.extend(NotifierMixin, {
	folderService: service('folder'),
	userService: service('user'),
	folder: {},
	tab: "",
	localStorage: service(),
	store: service(),

	beforeModel: function (transition) {
		this.tab = is.not.undefined(transition.queryParams.tab) ? transition.queryParams.tab : "tabGeneral";
	},

	model(params) {
		return this.get('folderService').getFolder(params.folder_id);
	},

	setupController(controller, model) {
		this.folder = model;
		controller.set('model', model);

		controller.set('tabGeneral', false);
		controller.set('tabShare', false);
		controller.set('tabPermissions', false);
		controller.set('tabDelete', false);
		controller.set(this.get('tab'), true);

		this.get('folderService').getAll().then((folders) => {
			controller.set('folders', folders.rejectBy('id', model.get('id')));
		});

		this.get('userService').getAll().then((users) => {
			controller.set('users', users);

			var folderPermissions = [];

			users.forEach((user) => {
				let isActive = user.get('active');

				let u = {
					userId: user.get('id'),
					fullname: user.get('fullname'),
					orgId: model.get('orgId'),
					folderId: model.get('id'),
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
				orgId: model.get('orgId'),
				folderId: model.get('id'),
				canEdit: false,
				canView: false
			};

			folderPermissions.pushObject(u);

			this.get('folderService').getPermissions(model.id).then((permissions) => {
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

				controller.set('permissions', folderPermissions.sortBy('fullname'));
			});
		});
	},

	actions: {
		onRename: function (folder) {
			let self = this;
			this.get('folderService').save(folder).then(function () {
				self.showNotification("Renamed");
			});
		},

		onRemove(moveId) {
			this.get('folderService').remove(this.folder.get('id'), moveId).then(() => { /* jshint ignore:line */
				this.showNotification("Deleted");
				this.get('localStorage').clearSessionItem('folder');

				this.get('folderService').getFolder(moveId).then((folder) => {
					this.get('folderService').setCurrentFolder(folder);
					this.transitionTo('folder', folder.get('id'), folder.get('slug'));
				});
			});
		},

		onShare: function(invitation) {
			this.get('folderService').share(this.folder.get('id'), invitation).then(() => {
				this.showNotification("Shared");
			});
		},

		onPermission: function (folder, message, permissions) {
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
