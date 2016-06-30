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

export default Ember.Component.extend({
    folderService: Ember.inject.service('folder'),
    appMeta: Ember.inject.service(),
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
        if (this.inviteMessage.length === 0) {
            this.set('inviteMessage', this.getDefaultInvitationMessage());
        }

        if (this.roleMessage.length === 0) {
            this.set('roleMessage', this.getDefaultInvitationMessage());
        }
    },

    actions: {
        rename() {
            if (is.empty(this.folder.get('name'))) {
                $("#folderName").addClass("error").focus();
                return;
            }

            this.sendAction("onRename", this.folder);
        },

        remove() {
            if (is.null(this.get('moveTarget'))) {
                $("#delete-target > select").addClass("error").focus();
                return;
            }

            this.sendAction("onRemove", this.get('moveTarget').get('id'));
        },

        share() {
            var email = this.get('inviteEmail').trim().replace(/ /g, '');
            var message = this.get('inviteMessage').trim();

            if (message.length === 0) {
                message = this.getDefaultInvitationMessage();
            }

            if (email.length === 0) {
                $("#inviteEmail").addClass("error").focus();
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

            this.set('inviteEmail', "");

            this.sendAction("onShare", result);
        },

        setPermissions() {
            var message = this.get('roleMessage').trim();

            if (message.length === 0) {
                message = this.getDefaultInvitationMessage();
            }

            this.get('permissions').forEach(function(permission, index) /* jshint ignore:line */ {
                Ember.set(permission, 'canView', $("#canView-" + permission.userId).prop('checked'));
                Ember.set(permission, 'canEdit', $("#canEdit-" + permission.userId).prop('checked'));
            });

            this.sendAction("onPermission", this.get('folder'), message, this.get('permissions'));
        }
    }
});
