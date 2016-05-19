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

export default BaseService.extend({
    sessionService: Ember.inject.service('session'),

    // selected folder
    currentFolder: null,
    canEditCurrentFolder: false,

    // Add a new folder.
    add(folder) {
        let appMeta = this.get('sessionService.appMeta');
        let url = appMeta.getUrl(`folders`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(folder),
                contentType: 'json',
                success: function(folder) {
                    let folderModel = models.FolderModel.create(folder);
                    resolve(folderModel);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Returns folder model for specified folder id.
    getFolder(id) {
        let appMeta = this.get('sessionService.appMeta')
        let url = appMeta.getUrl(`folders/${id}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let folder = models.FolderModel.create(response);
                    resolve(folder);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
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
        let url = this.get('sessionService').appMeta.getUrl(`folders/${id}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(folder),
                contentType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    remove: function(folderId, moveToId) {
        var self = this;
        var url = self.get('sessionService').appMeta.getUrl('folders/' + folderId + "/move/" + moveToId);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    onboard: function(folderId, payload) {
        var self = this;
        var url = self.get('sessionService').appMeta.getUrl('public/share/' + folderId);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: "POST",
                data: payload,
                contentType: "application/json",
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // getProtectedFolderInfo returns non-private folders and who has access to them.
    getProtectedFolderInfo: function() {
        var url = this.get('sessionService').appMeta.getUrl('folders?filter=viewers');

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let data = [];
                    _.each(response, function(obj) {
                        data.pushObject(models.ProtectedFolderParticipant.create(obj));
                    });

                    resolve(data);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // reloads and caches folders.
    reload() {
        let appMeta = this.get('sessionService.appMeta')
        let url = appMeta.getUrl(`folders`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let data = [];
                    _.each(response, function(obj) {
                        data.pushObject(models.FolderModel.create(obj));
                    });
                    resolve(data);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // so who can see/edit this folder?
    getPermissions(folderId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`folders/${folderId}/permissions`),
                type: 'GET',
                success: function(response) {
                    let data = [];
                    _.each(response, function(obj) {
                        data.pushObject(models.FolderPermissionModel.create(obj));
                    });
                    resolve(data);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // persist folder permissions
    savePermissions(folderId, payload) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`folders/${folderId}/permissions`),
                type: 'PUT',
                contentType: 'json',
                data: JSON.stringify(payload),
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // share this folder with new users!
    share(folderId, invitation) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`folders/${folderId}/invitation`),
                type: 'POST',
                contentType: 'json',
                data: JSON.stringify(invitation),
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Current folder caching
    setCurrentFolder(folder) {
        if (is.undefined(folder) || is.null(folder)) {
            return;
        }

        this.set('currentFolder', folder);
        this.get('sessionService').storeSessionItem("folder", folder.get('id'));
        this.set('canEditCurrentFolder', false);

        let userId = this.get('sessionService').user.get('id');
        if (userId === "") {
            userId = "0";
        }

        let url = this.get('sessionService').appMeta.getUrl('users/' + userId + "/permissions");
        let self = this;

        $.ajax({
            url: url,
            type: 'GET',
            success: function(folderPermissions) {
                // safety check
                self.set('canEditCurrentFolder', false);

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
                    self.set('canEditCurrentFolder', canEdit && self.get('sessionService').authenticated);
                });
            }
        });
    },
});