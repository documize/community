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
	copyPermission: true,
	copyDocument: false,
	clonedSpace: { id: "" },
	showSpace: false,
	showClone: false,

	didReceiveAttrs() {
		let folders = this.get('folders');
		let publicFolders = [];
		let protectedFolders = [];
		let privateFolders = [];

		_.each(folders, folder => {
			if (folder.get('folderType') === constants.FolderType.Public) {
				publicFolders.pushObject(folder);
			}
			if (folder.get('folderType') === constants.FolderType.Private) {
				privateFolders.pushObject(folder);
			}
			if (folder.get('folderType') === constants.FolderType.Protected) {
				protectedFolders.pushObject(folder);
			}
		});

		this.set('publicFolders', publicFolders);
		this.set('protectedFolders', protectedFolders);
		this.set('privateFolders', privateFolders);
		this.set('hasPublicFolders', this.get('publicFolders.length') > 0);
		this.set('hasPrivateFolders', this.get('privateFolders.length') > 0);
		this.set('hasProtectedFolders', this.get('protectedFolders.length') > 0);
	},

	actions: {
		onToggleCloneOptions() {
			this.set('showClone', !this.get('showClone'));
		},

		onToggleNewSpace() {
			let val = !this.get('showSpace');
			this.set('showSpace', val);

			if (val) {
				Ember.run.schedule('afterRender', () => {
					$("#new-folder-name").focus();
				});
			}
		},

		onCloneSpaceSelect(sp) {
			this.set('clonedSpace', sp)
		},

		onAdd() {
			let folderName = this.get('newFolder');
			let clonedId = this.get('clonedSpace.id');

			if (is.empty(folderName)) {
				$("#new-folder-name").addClass("error").focus();
				return false;
			}

			let payload = {
				name: folderName,
				CloneID: clonedId,
				copyTemplate: this.get('copyTemplate'),
				copyPermission: this.get('copyPermission'),
				copyDocument: this.get('copyDocument'),
			}

			this.attrs.onAddSpace(payload);
			this.set('showSpace', false);
			this.set('newFolder', '');

			return true;
		}
	}
});
