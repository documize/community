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

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),
    ajax: Ember.inject.service(),

    // Adds a new user.
    add(user) {
        let url = this.get('sessionService').appMeta.getUrl(`users`);

        return this.get('ajax').request(url, {
            type: 'POST',
            data: JSON.stringify(user),
            contentType: 'json'
        }).then(function(response){
            return models.UserModel.create(response);
        });
    },

    // Returns user model for specified user id.
    getUser(userId) {
        let url = this.get('sessionService').appMeta.getUrl(`users/${userId}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    resolve(models.UserModel.create(response));
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Returns all users for organization.
    getAll() {
        let url = this.get('sessionService').appMeta.getUrl(`users`);

        return this.get('ajax').request(url).then((response) => {
            return response.map(function(obj){
                return models.UserModel.create(obj);
            });
        });
    },

    // Returns all users that can see folder.
    getFolderUsers(folderId) {
        let url = this.get('sessionService').appMeta.getUrl(`users/folder/${folderId}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let data = [];
                    _.each(response, function(obj) {
                        data.pushObject(models.UserModel.create(obj));
                    });

                    resolve(data);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Updates an existing user record.
    save(user) {
        let userId = user.get('id');
        let url = this.get('sessionService').appMeta.getUrl(`users/${userId}`);

        return this.get('ajax').request(url, {
            type: 'PUT',
            data: JSON.stringify(user),
            contentType: 'json'
        });
    },

    // updatePassword changes the password for the specified user.
    updatePassword(userId, password) {
        let url = this.get('sessionService').appMeta.getUrl(`users/${userId}/password`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                data: password,
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Removes the specified user.
    remove(userId) {
        let url = this.get('sessionService').appMeta.getUrl(`users/${userId}`);

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

    // Request password reset.
    forgotPassword(email) {
        var url = this.get('sessionService').appMeta.getUrl('public/forgot');

        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (is.empty(email)) {
                reject("invalid");
                return;
            }

            var data = JSON.stringify({
                Email: email
            });

            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: data,
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Set new password.
    resetPassword(token, password) {
        var url = this.get('sessionService').appMeta.getUrl('public/reset/' + token);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (is.empty(token) || is.empty(password)) {
                reject("invalid");
                return;
            }

            $.ajax({
                url: url,
                type: 'POST',
                data: password,
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    }
});
