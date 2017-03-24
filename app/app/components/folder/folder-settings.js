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
import AuthMixin from '../../mixins/auth';

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(AuthMixin, {
	folderService: service('folder'),
	appMeta: service(),
	users: [],
	folders: [],
	folder: {},
	moveTarget: null,
	inviteEmail: "",
	inviteMessage: "",
	roleMessage: "",
	permissions: {},

	getDefaultInvitationMessage() {
		return "Hey there, I am sharing the " + this.folder.get('name') + " (in " + this.get("appMeta.title") + ") with you so we can both access the same documents.";
	},

	willRender() {
		if (this.roleMessage.length === 0) {
			this.set('roleMessage', this.getDefaultInvitationMessage());
		}
	},

	actions: {
	}
});
