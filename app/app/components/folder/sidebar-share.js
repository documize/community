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

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(NotifierMixin, {
	folderService: service('folder'),
	appMeta: service(),
	inviteEmail: '',
	inviteMessage: '',

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.folder.get('name') + " (in " + this.get("appMeta.title") + ") with you so we can both access the same documents.";
	},

	willRender() {
		if (this.get('inviteMessage').length === 0) {
			this.set('inviteMessage', this.getDefaultInvitationMessage());
		}
	},

	actions: {
		onShare() {
			var email = this.get('inviteEmail').trim().replace(/ /g, '');
			var message = this.get('inviteMessage').trim();

			if (message.length === 0) {
				message = this.getDefaultInvitationMessage();
			}

			if (email.length === 0) {
				$('#inviteEmail').addClass('error').focus();
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

			this.get('folderService').share(this.folder.get('id'), result).then(() => {
				this.showNotification('Shared');
			});
		}
	}
});
