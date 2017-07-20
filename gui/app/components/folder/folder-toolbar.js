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

const {
	computed
} = Ember;

export default Ember.Component.extend(NotifierMixin, TooltipMixin, AuthMixin, {
	folderService: Ember.inject.service('folder'),
	session: Ember.inject.service(),
	appMeta: Ember.inject.service(),
	showToolbar: false,
	folder: {},
	busy: false,
	isFolderOwner: computed.equal('folder.userId', 'session.user.id'),
	moveFolderId: "",
	drop: null,

	didReceiveAttrs() {
		this.set('isFolderOwner', this.get('folder.userId') === this.get("session.user.id"));

		let show = this.get('session.authenticated') || this.get('isFolderOwner') || this.get('hasSelectedDocuments') || this.get('folderService').get('canEditCurrentFolder');
		this.set('showToolbar', show);

		let targets = _.reject(this.get('folders'), {
			id: this.get('folder').get('id')
		});

		this.set('movedFolderOptions', targets);
	},

	didRender() {
		if (this.get('hasSelectedDocuments')) {
			this.addTooltip(document.getElementById("move-documents-button"));
			this.addTooltip(document.getElementById("delete-documents-button"));
		} else {
			if (this.get('isFolderOwner')) {
				this.addTooltip(document.getElementById("folder-share-button"));
				this.addTooltip(document.getElementById("folder-settings-button"));
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
