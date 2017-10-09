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
import DropdownMixin from '../../../mixins/dropdown';

export default Ember.Controller.extend(NotifierMixin, DropdownMixin, {
	folderService: Ember.inject.service('folder'),
	folders: [],
	dropdown: null,
	deleteSpace: {
		id: '',
		name: ''
	},

	label: function () {
		switch (this.get('folders').length) {
		case 1:
			return "space";
		default:
			return "spaces";
		}
	}.property('folders'),


	willDestroyElement() {
		this.destroyDropdown();
	},

	actions: {
		onShow(spaceId) {
			this.set('deleteSpace.id', spaceId);
			this.set('deleteSpace.name', '');
			$(".delete-space-dialog").css("display", "block");
			$('#delete-space-name').removeClass('error');

			let drop = new Drop({
				target: $("#delete-space-button-" + spaceId)[0],
				content: $(".delete-space-dialog")[0],
				classes: 'drop-theme-basic',
				position: "bottom right",
				openOn: "always",
				tetherOptions: {
					offset: "5px 0",
					targetOffset: "10px 0"
				},
				remove: false
			});

			this.set('dropdown', drop);
		},

		onCancel() {
			this.closeDropdown();
		},

		onDelete() {
			let deleteSpace = this.get('deleteSpace');
			let spaceId = deleteSpace.id;
			let spaceNameTyped = deleteSpace.name;
			let space = this.get('folders').findBy('id', spaceId);
			let spaceName = space.get('name');

			if (spaceNameTyped !== spaceName || spaceNameTyped === '' || spaceName === '') {
				$('#delete-space-name').addClass('error').focus();
				return;
			}

			this.closeDropdown();

			this.get('folderService').delete(spaceId).then(() => { /* jshint ignore:line */
				this.set('deleteSpace.id', '');
				this.set('deleteSpace.name', '');
				this.showNotification("Deleted");

				this.get('folderService').adminList().then((folders) => {
					let nonPrivateFolders = folders.rejectBy('folderType', 2);
					if (is.empty(nonPrivateFolders) || is.null(folders) || is.undefined(folders)) {
						nonPrivateFolders = [];
					}

					this.set('folders', nonPrivateFolders);
				});
			});
		}
	}
});
