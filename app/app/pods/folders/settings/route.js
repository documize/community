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
import models from '../../../utils/model';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Route.extend(NotifierMixin, {
	folderService: Ember.inject.service('folder'),
	userService: Ember.inject.service('user'),
	folder: {},
	tab: "",

	beforeModel: function (transition) {
		this.tab = is.not.undefined(transition.queryParams.tab) ? transition.queryParams.tab : "tabGeneral";
	},

	model(params) {
		return this.get('folderService').getFolder(params.folder_id);
	},

	setupController(controller, model) {
		var self = this;
		this.folder = model;
		controller.set('model', model);

		controller.set('tabGeneral', false);
		controller.set('tabShare', false);
		controller.set('tabPermissions', false);
		controller.set('tabDelete', false);
		controller.set(this.get('tab'), true);

		this.get('folderService').getAll().then(function (folders) {
			controller.set('folders', folders.rejectBy('id', model.get('id')));
		});

		this.get('userService').getAll().then(function (users) {
			controller.set('users', users);

			var folderPermissions = [];

			var u = models.FolderPermissionModel.create({
				userId: "",
				fullname: " Everyone",
				orgId: model.get('orgId'),
				folderId: model.get('id'),
				canEdit: false,
				canView: false
			});

			folderPermissions.pushObject(u);

			users.forEach(function (user, index) /* jshint ignore:line */ {
				if (user.get('active')) {
					var u = models.FolderPermissionModel.create({
						userId: user.get('id'),
						fullname: user.get('fullname'),
						orgId: model.get('orgId'),
						folderId: model.get('id'),
						canEdit: false,
						canView: false,
						canViewPrevious: false
					});

					folderPermissions.pushObject(u);
				}
			});

			self.get('folderService').getPermissions(model.id).then(function (permissions) {
				permissions.forEach(function (permission, index) /* jshint ignore:line */ {
					var folderPermission = folderPermissions.findBy('userId', permission.userId);
					if (is.not.undefined(folderPermission)) {
						Ember.set(folderPermission, 'orgId', permission.orgId);
						Ember.set(folderPermission, 'folderId', permission.folderId);
						Ember.set(folderPermission, 'canEdit', permission.canEdit);
						Ember.set(folderPermission, 'canView', permission.canView);
						Ember.set(folderPermission, 'canViewPrevious', permission.canView);
					}
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
			let self = this;

			this.get('folderService').remove(this.folder.get('id'), moveId).then(function () { /* jshint ignore:line */
				self.showNotification("Deleted");
				self.session.clearSessionItem('folder');

				self.get('folderService').getFolder(moveId).then(function (folder) {
					self.get('folderService').setCurrentFolder(folder);
					self.transitionTo('folders.folder', folder.get('id'), folder.get('slug'));
				});
			});
		},

		onShare: function (invitation) {
			let self = this;

			this.get('folderService').share(this.folder.get('id'), invitation).then(function () {
				self.showNotification("Shared");
			});
		},

		onPermission: function (folder, message, permissions) {
			var self = this;
			var data = permissions.map(function (obj) {
				return obj.getProperties('orgId', 'folderId', 'userId', 'canEdit', 'canView');
			});
			var payload = { Message: message, Roles: data };

			this.get('folderService').savePermissions(folder.get('id'), payload).then(function () {
				self.showNotification("Saved");
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