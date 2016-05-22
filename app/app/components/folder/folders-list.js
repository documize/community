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
import constants from '../../utils/constants';
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(TooltipMixin, {
    folderService: Ember.inject.service('folder'),
    publicFolders: [],
    protectedFolders: [],
    privateFolders: [],
    hasPublicFolders: false,
    hasProtectedFolders: false,
    hasPrivateFolders: false,
    newFolder: "",

    didInsertElement() {
        this._super(...arguments);
        if (this.session.authenticated) {
            this.addTooltip(document.getElementById("add-folder-button"));
        }
    },

    didReceiveAttrs() {
        let folders = this.get('folders');
        let self = this;

        // clear out state
        this.set('publicFolders', []);
        this.set('protectedFolders', []);
        this.set('privateFolders', []);

        _.each(folders, folder => {
            if (folder.folderType === constants.FolderType.Public) {
                let folders = self.get('publicFolders');
                folders.pushObject(folder);
                self.set('publicFolders', folders);
            }
            if (folder.folderType === constants.FolderType.Private) {
                let folders = self.get('privateFolders');
                folders.pushObject(folder);
                self.set('privateFolders', folders);
            }
            if (folder.folderType === constants.FolderType.Protected) {
                let folders = self.get('protectedFolders');
                folders.pushObject(folder);
                self.set('protectedFolders', folders);
            }
        });

        this.set('hasPublicFolders', this.get('publicFolders.length') > 0);
        this.set('hasPrivateFolders', this.get('privateFolders.length') > 0);
        this.set('hasProtectedFolders', this.get('protectedFolders.length') > 0);
    },

    willDestroyElement() {
        this.destroyTooltips();
    },

    actions: {
        addFolder() {
            var folderName = this.get('newFolder');

            if (is.empty(folderName)) {
                $("#new-folder-name").addClass("error").focus();
                return false;
            }

            this.attrs.onFolderAdd(folderName);

            this.set('newFolder', "");
            return true;
        }
    }
});