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
import TooltipMixin from '../../mixins/tooltip';
import AuthMixin from '../../mixins/auth';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, AuthMixin, {
	folderService: Ember.inject.service('folder'),
	session: Ember.inject.service(),
	appMeta: Ember.inject.service(),
	showToolbar: false,
	folder: {},
	busy: false,
	moveFolderId: "",
	drop: null,

	didReceiveAttrs() {
		console.log(this.get('permissions'));
		let targets = _.reject(this.get('folders'), {
			id: this.get('folder').get('id')
		});

		this.set('movedFolderOptions', targets);
	},

	didRender() {
		if (this.get('hasSelectedDocuments')) {
			if (this.get('permissions.documentMove')) {
				this.addTooltip(document.getElementById("move-documents-button"));
			}
			if (this.get('permissions.documentDelete')) {
				this.addTooltip(document.getElementById("delete-documents-button"));
			}
		} else {
			if (this.get('permissions.spaceOwner')) {
				this.addTooltip(document.getElementById("space-delete-button"));
			}
			if (this.get('permissions.spaceManage')) {
				this.addTooltip(document.getElementById("space-settings-button"));
			}
		}
	},

	willDestroyElement() {
		if (is.not.null(this.get('drop'))) {
			this.get('drop').destroy();
			this.set('drop', null);
		}

		this.destroyTooltips();
	},

	actions: {
		deleteDocuments() {
			this.attrs.onDeleteDocument();
		},

		setMoveFolder(folderId) {
			this.set('moveFolderId', folderId);

			let folders = this.get('folders');

			folders.forEach(folder => {
				folder.set('selected', folder.id === folderId);
			});
		},

		moveDocuments() {
			if (this.get("moveFolderId") === "") {
				return false;
			}

			this.attrs.onMoveDocument(this.get('moveFolderId'));

			return true;
		}
	}
});
