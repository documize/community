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

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import AuthMixin from '../../mixins/auth';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(AuthMixin, Notifier, {
	spaceSvc: service('folder'),

	isSpaceAdmin: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	inviteEmail: '',
	inviteMessage: '',

	init() {
		this._super(...arguments);
	},

	didReceiveAttrs() {
		this._super(...arguments);

		if (this.get('inviteMessage').length === 0) {
			this.set('inviteMessage', this.getDefaultInvitationMessage());
		}
	},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.get('space.name') + " space (in " + this.get("appMeta.title") + ") with you so we can both collaborate on documents.";
	},

	actions: {
		onSpaceInvite(e) {
			e.preventDefault();

			var email = this.get('inviteEmail').trim().replace(/ /g, '');
			var message = this.get('inviteMessage').trim();

			if (message.length === 0) {
				this.set('inviteMessage', this.getDefaultInvitationMessage());
				message = this.getDefaultInvitationMessage();
			}

			if (email.length === 0) {
				this.$('#space-invite-email').addClass('is-invalid').focus();
				return;
			}

			this.showWait();

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

			this.get('spaceSvc').share(this.get('space.id'), result).then(() => {
				this.showDone();
				this.$('#space-invite-email').removeClass('is-invalid');
			});
		},
	}
});
