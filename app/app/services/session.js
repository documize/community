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
    computed: { oneWay, or },
    computed
} = Ember;

export default SimpleAuthSession.extend({
    ajax: service(),
    appMeta: service(),

    authenticated: oneWay('isAuthenticated'),
    isAdmin: oneWay('user.admin'),
    isEditor: or('user.admin', 'user.editor'),

    user: computed('session.content.authenticated.user', function(){
        let user = this.get('session.content.authenticated.user');
        if (user) {
            return models.UserModel.create(user);
        }
    }),

    folderPermissions: null,
    currentFolder: null,

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
