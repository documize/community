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
import encodingUtil from 'documize/utils/encoding';
import netUtil from 'documize/utils/net';
import models from 'documize/utils/model';
import SimpleAuthSession from 'ember-simple-auth/services/session';

const {
    inject: { service },
    computed: { oneWay, or },
    computed
} = Ember;

const Session = SimpleAuthSession.extend({
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
        // localStorage.clear();
    },

    storeSessionItem: function() {
        // localStorage[key] = data;
    },

    getSessionItem: function() {
        // return localStorage[key];
    },

    clearSessionItem: function() {
        // delete localStorage[key];
    }
});


export default Ember.Test.registerAsyncHelper('stubSession', function(app, test, attrs={}) {
    test.register('service:session', Session.extend(attrs));
});
