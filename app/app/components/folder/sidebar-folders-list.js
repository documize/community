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

	// init() {
	// 	this._super(...arguments);

	// 	if (this.get('noFolder')) {
	// 		return;
	// 	}

	// 	let _this = this;
	// 	this.get('templateService').getSavedTemplates().then(function(saved) {
    //         let emptyTemplate = {
    //             id: "0",
    //             title: "Empty",
	// 			description: "An empty canvas for your words",
	// 			img: "insert_drive_file",
	// 			layout: "doc",
	// 			locked: true
    //         };

	// 		saved.forEach(function(t) {
	// 			Ember.set(t, 'img', 'content_copy');
	// 		});

    //         saved.unshiftObject(emptyTemplate);
    //         _this.set('savedTemplates', saved);
    //     });
	// },

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
		// onImport() {
		// 	this.attrs.onImport();
		// },

		addFolder() {
			var folderName = this.get('newFolder');

			if (is.empty(folderName)) {
				$("#new-folder-name").addClass("error").focus();
				return false;
			}

			this.attrs.onFolderAdd(folderName);

			this.set('newFolder', '');
			return true;
		},

		// showDocument() {
		// 	this.set('showingDocument', true);
		// 	this.set('showingList', false);
		// },

		// showList() {
		// 	this.set('showingDocument', false);
		// 	this.set('showingList', true);
		// },

		// onEditTemplate(template) {
        //     this.navigateToDocument(template);
        // },

        // onDocumentTemplate(id /*, title, type*/ ) {
        //     let self = this;

        //     this.send("showNotification", "Creating");

        //     this.get('templateService').importSavedTemplate(this.folder.get('id'), id).then(function(document) {
        //         self.navigateToDocument(document);
        //     });
        // },
	}
});
