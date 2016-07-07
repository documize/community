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
import models from '../utils/model';
import BaseService from '../services/base';

const {
    get
} = Ember;

export default BaseService.extend({
    sessionService: Ember.inject.service('session'),
    ajax: Ember.inject.service(),
    localStorage: Ember.inject.service(),


    // selected folder
    currentFolder: null,
    canEditCurrentFolder: false,

    // Add a new folder.
    add(folder) {

        return this.get('ajax').post(`folders`, {
            contentType: 'json',
            data: JSON.stringify(folder)
        }).then((folder)=>{
            let folderModel = models.FolderModel.create(folder);
            return folderModel;
        });
    },

    // Returns folder model for specified folder id.
    getFolder(id) {

        return this.get('ajax').request(`folders/${id}`, {
            method: 'GET'
        }).then((response)=>{
            let folder = models.FolderModel.create(response);
            return folder;
        });
    },

    // Returns all folders that user can see.
    getAll() {
        let self = this;

        if (this.get('folders') != null) {
            return new Ember.RSVP.Promise(function(resolve) {
                resolve(self.get('folders'));
            });
        } else {
            return this.reload();
        }
    },

    // Updates an existing folder record.
    save(folder) {
        let id = folder.get('id');

        return this.get('ajax').request(`folders/${id}`, {
            method: 'PUT',
            contentType: 'json',
            data: JSON.stringify(folder)
        });
    },

    remove: function(folderId, moveToId) {
        let url = `folders/${folderId}/move/${moveToId}`;

        return this.get('ajax').request(url, {
            method: 'DELETE'
        });
    },

    onboard: function(folderId, payload) {
        let url = `public/share/${folderId}`;

        return this.get('ajax').post(url, {
            contentType: "application/json",
            data: payload
        });
    },

    // getProtectedFolderInfo returns non-private folders and who has access to them.
    getProtectedFolderInfo: function() {
        return this.get('ajax').request(`folders?filter=viewers`, {
            method: "GET"
        }).then((response)=>{
            let data = [];
            _.each(response, function(obj) {
                data.pushObject(models.ProtectedFolderParticipant.create(obj));
            });

            return data;
        });
    },

    // reloads and caches folders.
    reload() {

        return this.get('ajax').request(`folders`, {
            method: "GET"
        }).then((response)=>{
            let data = [];
            _.each(response, function(obj) {
                data.pushObject(models.FolderModel.create(obj));
            });

            return data;
        });
    },

    // so who can see/edit this folder?
    getPermissions(folderId) {

        return this.get('ajax').request(`folders/${folderId}/permissions`, {
            method: "GET"
        }).then((response)=>{
            let data = [];
            _.each(response, function(obj) {
                data.pushObject(models.FolderPermissionModel.create(obj));
            });

            return data;
        });
    },

    // persist folder permissions
    savePermissions(folderId, payload) {

        return this.get('ajax').request(`folders/${folderId}/permissions`, {
            method: 'PUT',
            contentType: 'json',
            data: JSON.stringify(payload)
        });
    },

    // share this folder with new users!
    share(folderId, invitation) {

        return this.get('ajax').post(`folders/${folderId}/invitation`, {
            contentType: 'json',
            data: JSON.stringify(invitation)
        });
    },

    // Current folder caching
    setCurrentFolder(folder) {
        if (is.undefined(folder) || is.null(folder)) {
            return;
        }

        this.set('currentFolder', folder);
        this.get('localStorage').storeSessionItem("folder", get(folder, 'id'));
        this.set('canEditCurrentFolder', false);

        let userId = this.get('sessionService.user.id');
        if (userId === "") {
            userId = "0";
        }

        let url = `users/${userId}/permissions`;

        return this.get('ajax').request(url).then((folderPermissions) => {
            // safety check
            this.set('canEditCurrentFolder', false);

            if (folderPermissions.length === 0) {
                return;
            }

            let result = [];
            let folderId = folder.get('id');

            folderPermissions.forEach(function(item) {
                if (item.folderId === folderId) {
                    result.push(item);
                }
            });

            let canEdit = false;

            result.forEach(function(permission) {
                if (permission.userId === userId) {
                    canEdit = permission.canEdit;
                }

                if (permission.userId === "" && !canEdit) {
                    canEdit = permission.canEdit;
                }
            });
            Ember.run(() => {
                this.set('canEditCurrentFolder', canEdit && this.get('sessionService.authenticated'));
            });
        });
    },
});
