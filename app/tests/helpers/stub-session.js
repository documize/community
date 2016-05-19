import Ember from 'ember';
import models from 'documize/utils/model';
import encodingUtil from 'documize/utils/encoding';
import netUtil from 'documize/utils/net';

const Session = Ember.Service.extend({

    ready: false,
    appMeta: null,
    isMac: false,
    isMobile: false,
    previousTransition: null,
    user: null,
    authenticated: false,
    folderPermissions: null,
    currentFolder: null,

    init: function() {
        this.set('user', models.UserModel.create());
        this.appMeta = models.AppMeta.create();

        this.set('isMac', is.mac());
        this.set('isMobile', is.mobile());
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

    login(credentials) {
        // TODO: figure out what to do with credentials
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

        $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
            jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
        });
    },

    clearSession: function() {
        this.set('user', null);
        this.set('authenticated', false);
        // localStorage.clear();
    },

    storeSessionItem: function(key, data) {
        // localStorage[key] = data;
        // console.log(data);
    },

    getSessionItem: function(key) {
        // return localStorage[key];
        // console.log(data);
    },

    clearSessionItem: function(key) {
        // delete localStorage[key];
    },

    // boot(){
    //     console.log(this.get('appMeta'));
    //     return new Ember.RSVP.resolve();
    // },

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
    },

    getSessionItem(key){
        return this.get(`data.${key}`);
    },

    sso: function(credentials) {

    }
});

export default Ember.Test.registerAsyncHelper('stubSession', function(app, test, attrs={}) {
    test.register('service:session', Session.extend(attrs));
});
