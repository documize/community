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

import Component from '@ember/component';
import { schedule } from '@ember/runloop';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import NotifierMixin from '../../mixins/notifier';
import AuthMixin from '../../mixins/auth';

export default Component.extend(NotifierMixin, AuthMixin, {
	session: service(),
	appMeta: service(),
	pinned: service(),
	spaceName: '',
	copyTemplate: true,
	copyPermission: true,
	copyDocument: false,
	clonedSpace: { id: '' },
	pinState : {
		isPinned: false,
		pinId: '',
		newName: ''
	},
	spaceSettings: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),
	deleteSpaceName: '',

	didReceiveAttrs() {
		this._super(...arguments);

		let folder = this.get('space');
		let targets = _.reject(this.get('spaces'), {id: folder.get('id')});

		this.get('pinned').isSpacePinned(folder.get('id')).then((pinId) => {
			this.set('pinState.pinId', pinId);
			this.set('pinState.isPinned', pinId !== '');
			this.set('pinState.newName', folder.get('name'));
			this.renderTooltips();
		});

		this.set('movedFolderOptions', targets);
	},

	didInsertElement() {
		this._super(...arguments);

		$('#add-space-modal').on('show.bs.modal', function(event) { // eslint-disable-line no-unused-vars
			schedule('afterRender', () => {
				$("#new-document-name").focus();
			});
		});
	},

	renderTooltips() {
		schedule('afterRender', () => {
			$('#pin-space-button').tooltip('dispose');
			$('body').tooltip({selector: '#pin-space-button'});
		});
	},

	actions: {
		onUnpin() {
			this.get('pinned').unpinItem(this.get('pinState.pinId')).then(() => {
				$('#pin-space-button').tooltip('dispose');
				this.set('pinState.isPinned', false);
				this.set('pinState.pinId', '');
				this.eventBus.publish('pinChange');
				this.renderTooltips();
			});
		},

		onPin() {
			let pin = {
				pin: this.get('pinState.newName'),
				documentId: '',
				folderId: this.get('space.id')
			};

			this.get('pinned').pinItem(pin).then((pin) => {
				$('#pin-space-button').tooltip('dispose');
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
				this.renderTooltips();
			});

			return true;
		},

		onDeleteSpace(e) {
			e.preventDefault();

			let spaceName = this.get('space').get('name');
			let spaceNameTyped = this.get('deleteSpaceName');

			if (spaceNameTyped !== spaceName || spaceNameTyped === '' || spaceName === '') {
				$("#delete-space-name").addClass("is-invalid").focus();
				return;
			}

			this.set('deleteSpaceName', '');
			$("#delete-space-name").removeClass("is-invalid");

			this.attrs.onDeleteSpace(this.get('space.id'));

			$('#delete-space-modal').modal('hide');
			$('#delete-space-modal').modal('dispose');
		},

		onAddSpace(e) {
			e.preventDefault();

			let spaceName = this.get('spaceName');
			let clonedId = this.get('clonedSpace.id');

			if (is.empty(spaceName)) {
				$("#new-space-name").addClass("is-invalid").focus();
				return false;
			}

			let payload = {
				name: spaceName,
				CloneID: clonedId,
				copyTemplate: this.get('copyTemplate'),
				copyPermission: this.get('copyPermission'),
				copyDocument: this.get('copyDocument'),
			}

			this.set('spaceName', '');
			this.set('clonedSpace.id', '');
			$("#new-space-name").removeClass("is-invalid");

			$('#add-space-modal').modal('hide');
			$('#add-space-modal').modal('dispose');

			this.attrs.onAddSpace(payload);
		},

		onImport() {
			this.attrs.onRefresh();
		},

		onHideStartDocument() {
			// this.set('showStartDocument', false);
		}
	}
});
