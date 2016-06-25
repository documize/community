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
    ajax: Ember.inject.service(),

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
        let url = this.appMeta.getUrl('public/authenticate');
        let domain = netUtil.getSubdomain();

        this.clearSession();

        if (is.empty(credentials.email) || is.empty(credentials.password)) {
            return Ember.RSVP.reject("invalid");
        }

        var encoded = encodingUtil.Base64.encode(domain + ":" + credentials.email + ":" + credentials.password);
        var headers = {
            'Authorization': 'Basic ' + encoded
        };

        return this.get('ajax').post(url, {
            headers
        }).then((response)=>{
            this.setSession(response.token, models.UserModel.create(response.user));
            this.get('ready', true);
            return response;
        });
    },

    // SSO in the form of 'domain:email:password'
    sso: function(credentials) {
        let url = this.appMeta.getUrl('public/authenticate');
        this.clearSession();

        if (is.empty(credentials.email) || is.empty(credentials.password)) {
            return Ember.RSVP.reject("invalid");
        }

        var headers = {
            'Authorization': 'Basic ' + credentials
        };

        return this.get('ajax').post(url, {
            headers
        }).then((response)=>{
            this.setSession(response.token, models.UserModel.create(response.user));
            this.get('ready', true);
            return response;
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

        let url = this.get('appMeta').getUrl("public/meta");

        return this.get('ajax').request(url)
        .then((response) => {
            this.get('appMeta').set('orgId', response.orgId);
            this.get('appMeta').setSafe('title', response.title);
            this.get('appMeta').set('version', response.version);
            this.get('appMeta').setSafe('message', response.message);
            this.get('appMeta').set('allowAnonymousAccess', response.allowAnonymousAccess);

            let token = this.getSessionItem('token');

            if (is.not.undefined(token)) {
                // We now validate current token
                let tokenCheckUrl = this.get('appMeta').getUrl(`public/validate?token=${token}`);

                return this.get('ajax').request(tokenCheckUrl, {
                    method: 'GET',
                    contentType: 'json'
                }).then((user) => {
                    this.setSession(token, models.UserModel.create(user));
                    this.set('ready', true);
                }).catch((reason) => {
                    if (netUtil.isAjaxAccessError(reason)) {
                        localStorage.clear();
                        window.location.href = "/auth/login";
                    }
                });
            }
        });

		let token = this.getSessionItem('token');

		// TODO: the rest should be done through ESA
		if (is.not.undefined(token)) {
			// We now validate current token

			return this.get('ajax').request(`public/validate?token=${token}`, {
				method: 'GET',
				contentType: 'json'
			}).then((user) => {
				this.setSession(token, models.UserModel.create(user));
				this.set('ready', true);
			}).catch((reason) => {
				if (netUtil.isAjaxAccessError(reason)) {
					localStorage.clear();
					window.location.href = "/auth/login";
				}
			});
		}
    }
});
