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
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';
import ModalMixin from '../../mixins/modal';
import AuthMixin from '../../mixins/auth';

export default Component.extend(NotifierMixin, ModalMixin, TooltipMixin, AuthMixin, {
	spaceService: service('folder'),
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
	inviteEmail: '',
	inviteMessage: '',

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

		if (this.get('inviteMessage').length === 0) {
			this.set('inviteMessage', this.getDefaultInvitationMessage());
		}
	},

	didInsertElement() {
		this._super(...arguments);

		this.modalInputFocus('#space-delete-modal', '#delete-space-name');
		this.modalInputFocus('#space-invite-modal', '#space-invite-email');
	},

	willDestroyElement() {
		this._super(...arguments);
		this.removeTooltips();
	},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.get('space.name') + " space (in " + this.get("appMeta.title") + ") with you so we can both collaborate on documents.";
	},

	actions: {
		onUnpin() {
			this.get('pinned').unpinItem(this.get('pinState.pinId')).then(() => {
				$('#space-pin-button').tooltip('dispose');
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
				$('#space-pin-button').tooltip('dispose');
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
				this.renderTooltips();
			});

			return true;
		},

		onSpaceInvite(e) {
			e.preventDefault();

			var email = this.get('inviteEmail').trim().replace(/ /g, '');
			var message = this.get('inviteMessage').trim();

			if (message.length === 0) {
				message = this.getDefaultInvitationMessage();
			}

			if (email.length === 0) {
				$('#space-invite-email').addClass('is-invalid').focus();
				return;
			}

			var result = {
				Message: message,
				Recipients: []
			};

			// Check for multiple email addresses
			if (email.indexOf(",") > -1) {
				result.Recipients = email.split(',');
			}
			if (email.indexOf(";") > -1 && result.Recipients.length === 0) {
				result.Recipients = email.split(';');
			}

			// Handle just one email address
			if (result.Recipients.length === 0 && email.length > 0) {
				result.Recipients.push(email);
			}

			this.set('inviteEmail', '');

			this.get('spaceService').share(this.get('space.id'), result).then(() => {
				$('#space-invite-email').removeClass('is-invalid');
			});

			this.modalClose('#space-invite-modal');
		},

		onSpaceDelete(e) {
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


			this.modalClose('#space-delete-modal');
		},

		onAddSpace(e) {
			e.preventDefault();
		},

		onImport() {
			this.attrs.onRefresh();
		},

		onHideStartDocument() {
			// this.set('showStartDocument', false);
		}
	}
});
