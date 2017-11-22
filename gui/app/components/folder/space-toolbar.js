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

import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';
import AuthMixin from '../../mixins/auth';

export default Component.extend(NotifierMixin, TooltipMixin, AuthMixin, {
	folderService: service('folder'),
	session: service(),
	appMeta: service(),
	pinned: service(),
	showToolbar: false,
	folder: {},
	busy: false,
	moveFolderId: "",
	drop: null,
	pinState : {
		isPinned: false,
		pinId: '',
		newName: ''
	},
	deleteSpaceName: '',
	spaceSettings: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		let folder = this.get('folder');
		let targets = _.reject(this.get('folders'), {id: folder.get('id')});

		this.set('movedFolderOptions', targets);
	},

	didRender() {
		this._super(...arguments);
		this.renderTooltips();
	},

	renderTooltips() {
		this.destroyTooltips();
	},

	willDestroyElement() {
		this._super(...arguments);

		if (this.get('isDestroyed') || this.get('isDestroying')) return;

		if (is.not.null(this.get('drop'))) {
			this.get('drop').destroy();
			this.set('drop', null);
		}

		this.destroyTooltips();
	},

	actions: {
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
		},

		onStartDocument() {
			this.attrs.onStartDocument();
		}
	}
});
