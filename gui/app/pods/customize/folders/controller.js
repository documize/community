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

import $ from 'jquery';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Notifier from '../../../mixins/notifier';
import TooltipMixin from '../../../mixins/tooltip';
import Controller from '@ember/controller';

export default Controller.extend(TooltipMixin, Notifier, {
	folderService: service('folder'),
	browserSvc: service('browser'),
	documentSvc: service('document'),
	dropdown: null,

	init() {
		this._super(...arguments);
		this.folders = [];
		this.deleteSpace = {
			id: '',
			name: ''
		};
	},

	label: computed('folders', function() {
		switch (this.get('folders').length) {
		case 1:
			return "space";
		default:
			return "spaces";
		}
	}),

	actions: {
		onShow(id) {
			this.set('deleteSpace.id', id);
		},

		onDelete() {
			let deleteSpace = this.get('deleteSpace');
			let spaceId = deleteSpace.id;
			let spaceNameTyped = deleteSpace.name;
			let space = this.get('folders').findBy('id', spaceId);
			let spaceName = space.get('name');

			if (spaceNameTyped !== spaceName || spaceNameTyped === '' || spaceName === '') {
				$('#delete-space-name').addClass('is-invalid').focus();
				return;
			}

			$('#space-delete-modal').modal('hide');
			$('#space-delete-modal').modal('dispose');

			this.get('folderService').delete(spaceId).then(() => { /* jshint ignore:line */
				this.set('deleteSpace.id', '');
				this.set('deleteSpace.name', '');

				this.get('folderService').adminList().then((folders) => {
					let nonPrivateFolders = folders.rejectBy('folderType', 2);
					if (is.empty(nonPrivateFolders) || is.null(folders) || is.undefined(folders)) {
						nonPrivateFolders = [];
					}

					this.set('folders', nonPrivateFolders);
				});
			});
		},

		onExport() {
			this.showWait();

			let spec = {
				spaceId: '',
				data: _.pluck(this.get('folders'), 'id'),
				filterType: 'space',
			};

			this.get('documentSvc').export(spec).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, 'documize.html');
				this.showDone();
			});
		}
	}
});
