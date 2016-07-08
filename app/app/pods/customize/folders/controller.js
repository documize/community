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
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	folderService: Ember.inject.service('folder'),
	folders: [],

	label: function () {
		switch (this.get('folders').length) {
		case 1:
			return "space";
		default:
			return "spaces";
		}
	}.property('folders'),

	actions: {
		changeOwner: function (folderId, userId) {
			let self = this;
			this.get('folderService').getFolder(folderId).then(function (folder) {
				folder.set('userId', userId);

				self.get('folderService').save(folder).then(function () {
					self.showNotification("Changed");
					self.audit.record('changed-folder-owner');
				});

				self.send('onChangeOwner');
			});
		}
	}
});