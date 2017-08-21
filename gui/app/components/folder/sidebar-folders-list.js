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
import constants from '../../utils/constants';
import TooltipMixin from '../../mixins/tooltip';
import NotifierMixin from '../../mixins/notifier';
import AuthMixin from '../../mixins/auth';

export default Ember.Component.extend(TooltipMixin, NotifierMixin, AuthMixin, {
	publicFolders: [],
	protectedFolders: [],
	privateFolders: [],
	hasPublicFolders: false,
	hasProtectedFolders: false,
	hasPrivateFolders: false,
	newFolder: '',
	copyTemplate: true,
	copyBlock: true,
	copyPermission: true,
	copyDocument: false,

	didReceiveAttrs() {
		let folders = this.get('folders');

		// clear out state
		this.set('publicFolders', []);
		this.set('protectedFolders', []);
		this.set('privateFolders', []);

		_.each(folders, folder => {
			if (folder.get('folderType') === constants.FolderType.Public) {
				let folders = this.get('publicFolders');
				folders.pushObject(folder);
				this.set('publicFolders', folders);
			}
			if (folder.get('folderType') === constants.FolderType.Private) {
				let folders = this.get('privateFolders');
				folders.pushObject(folder);
				this.set('privateFolders', folders);
			}
			if (folder.get('folderType') === constants.FolderType.Protected) {
				let folders = this.get('protectedFolders');
				folders.pushObject(folder);
				this.set('protectedFolders', folders);
			}
		});

		this.set('hasPublicFolders', this.get('publicFolders.length') > 0);
		this.set('hasPrivateFolders', this.get('privateFolders.length') > 0);
		this.set('hasProtectedFolders', this.get('protectedFolders.length') > 0);
	},

	actions: {
		addFolder() {
			var folderName = this.get('newFolder');

			if (is.empty(folderName)) {
				$("#new-folder-name").addClass("error").focus();
				return false;
			}

			this.attrs.onFolderAdd(folderName);

			this.set('newFolder', '');
			return true;
		}
	}
});
