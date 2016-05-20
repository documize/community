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

export default Ember.Service.extend({
    ready: false,
    appMeta: null,
    isMac: false,
    isMobile: false,
    previousTransition: null,
    user: null,
    authenticated: false,
    folderPermissions: null,
    currentFolder: null,

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

    // Boot up
    init: function() {
        this.set('user', models.UserModel.create());
        this.appMeta = models.AppMeta.create();

        this.set('isMac', is.mac());
        this.set('isMobile', is.mobile());
    },

    // Authentication
    login: function(credentials) {
        var self = this;
        var url = self.appMeta.getUrl('public/authenticate');
        let domain = netUtil.getSubdomain();

        this.clearSession();

        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (is.empty(credentials.email) || is.empty(credentials.password)) {
                reject("invalid");
                return;
            }

            var encoded = encodingUtil.Base64.encode(domain + ":" + credentials.email + ":" + credentials.password);
            var header = {
                'Authorization': 'Basic ' + encoded
            };

            $.ajax({
                url: url,
                type: 'POST',
                headers: header,
                success: function(response) {
                    self.setSession(response.token, models.UserModel.create(response.user));
                    self.get('ready', true);
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // SSO in the form of 'domain:email:password'
    sso: function(credentials) {
        var self = this;
        var url = self.appMeta.getUrl('public/authenticate');
        this.clearSession();

        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (is.empty(credentials.email) || is.empty(credentials.password)) {
                reject("invalid");
                return;
            }

            var header = {
                'Authorization': 'Basic ' + credentials
            };

            $.ajax({
                url: url,
                type: 'POST',
                headers: header,
                success: function(response) {
                    self.setSession(response.token, models.UserModel.create(response.user));
                    self.get('ready', true);
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Goodbye
    logout: function() {
        this.clearSession();
    },

    // Session management
    setSession: function(token, user) {
        this.set('user', user);
        this.set('authenticated', true);

        this.storeSessionItem('token', token);
        this.storeSessionItem('user', JSON.stringify(user));

        let self = this;

        $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
            // We only tack on auth header for Documize API calls
            if (is.startWith(options.url, self.get('appMeta.url'))) {
                jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
            }
        });
    },

    clearSession: function() {
        this.set('user', null);
        this.set('authenticated', false);
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
    },

    // Application boot process
    boot() {
        let self = this;
        let dbhash = "";

        if (is.not.null(document.head.querySelector("[property=dbhash]"))) {
            dbhash = document.head.querySelector("[property=dbhash]").content;
        }

        if (dbhash.length > 0 && dbhash !== "{{.DBhash}}") {
            self.get('appMeta').set('orgId', "response.orgId");
            self.get('appMeta').setSafe('title', "Documize Setup");
            self.get('appMeta').set('version', "response.version");
            self.get('appMeta').setSafe('message', "response.message");
            self.get('appMeta').set('allowAnonymousAccess', false);
            self.set('ready', true);
            return new Ember.RSVP.Promise(function(resolve) {
                resolve();
            });
        }

        if (this.get('ready')) {
            return new Ember.RSVP.Promise(function(resolve) {
                resolve();
            });
        }

		var blockedPopupTest = window.open("http://d27wjpa4h6c9yx.cloudfront.net/", "directories=no,height=1,width=1,menubar=no,resizable=no,scrollbars=no,status=no,titlebar=no,top=0,location=no");

		if (!blockedPopupTest) {
			this.set('popupBlocked', true);
		} else {
			blockedPopupTest.close();
			this.set('popupBlocked', false);
		}

        return new Ember.RSVP.Promise(function(resolve) {
            $.ajax({
                url: self.get('appMeta').getUrl("public/meta"),
                type: 'GET',
                contentType: 'json',
                success: function(response) {
                    self.get('appMeta').set('orgId', response.orgId);
                    self.get('appMeta').setSafe('title', response.title);
                    self.get('appMeta').set('version', response.version);
                    self.get('appMeta').setSafe('message', response.message);
                    self.get('appMeta').set('allowAnonymousAccess', response.allowAnonymousAccess);

                    let token = self.getSessionItem('token');

                    if (is.not.undefined(token)) {
                        // We now validate current token
                        let tokenCheckUrl = self.get('appMeta').getUrl(`public/validate?token=${token}`);

                        $.ajax({
                            url: tokenCheckUrl,
                            type: 'GET',
                            contentType: 'json',
                            success: function(user) {
                                self.setSession(token, models.UserModel.create(user));
                                self.set('ready', true);
                                resolve();
                            },
                            error: function(reason) {
                                if (reason.status === 401 || reason.status === 403) {
                                    localStorage.clear();
                                    window.location.href = "/auth/login";
                                }
                            }
                        });
                    } else {
                        self.set('ready', true);
                        resolve();
                    }
                },
                error: function(reason) {
                    if (reason.status === 401 || reason.status === 403) {
                        window.location.href = "https://documize.com";
                    }
                }
            });
        });
    }
});
