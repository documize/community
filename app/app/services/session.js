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
import encodingUtil from '../utils/encoding';
import netUtil from '../utils/net';
import models from '../utils/model';
import SimpleAuthSession from 'ember-simple-auth/services/session';

const {
    inject: { service },
    computed: { oneWay }
} = Ember;

export default SimpleAuthSession.extend({
    ajax: service(),
    appMeta: service(),

    authenticated: oneWay('isAuthenticated'),
    user: oneWay('session.content.authenticated.user'),
    folderPermissions: null,
    currentFolder: null,

    authenticate() {
        return this._super(...arguments)
            .then(function({token, user}){
                return {
                    token,
                    user: models.User.create(user)
                };
            });
    },

    isAdmin: function() {
        if (this.authenticated && is.not.null(this.user) && this.user.id !== "") {
            return this.user.admin;
        }
        return false;
    }.property('user'),

    isEditor: function() {
        if (this.authenticated && is.not.null(this.user) && this.user.id !== "") {
            return this.user.editor || this.user.admin;
        }
        return false;
    }.property('user'),

    clearSession: function() {
        // TODO: clear session properly with ESA
        localStorage.clear();
    },

    storeSessionItem: function(key, data) {
        localStorage[key] = data;
    },

    getSessionItem: function(key) {
        return localStorage[key];
    },

    clearSessionItem: function(key) {
        delete localStorage[key];
    }
});
