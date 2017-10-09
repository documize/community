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

const {
	inject: { service }
} = Ember;

export default Ember.Controller.extend(NotifierMixin, {
	documentService: service('document'),
	folderService: service('folder'),
	localStorage: service('localStorage'),
	queryParams: ['tab'],
	tab: 'index',

	actions: {
		onAddSpace(payload) {
			let self = this;
			this.showNotification("Added");

			this.get('folderService').add(payload).then(function (newFolder) {
				self.get('folderService').setCurrentFolder(newFolder);
				self.transitionToRoute('folder', newFolder.get('id'), newFolder.get('slug'));
			});
		},

		onRefresh() {
			this.get('target._routerMicrolib').refresh();
		}
	}
});
