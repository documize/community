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
        // localStorage.clear();
    },

    storeSessionItem: function() {
        // localStorage[key] = data;
        // console.log(data);
    },

    getSessionItem: function() {
        // return localStorage[key];
        // console.log(data);
    },

    clearSessionItem: function() {
        // delete localStorage[key];
    },

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

        // var blockedPopupTest = window.open("http://maintenance.documize.com", "directories=no,height=1,width=1,menubar=no,resizable=no,scrollbars=no,status=no,titlebar=no,top=0,location=no");
        //
        // if (!blockedPopupTest) {
        // 	this.set('popupBlocked', true);
        // } else {
        // 	blockedPopupTest.close();
        // 	this.set('popupBlocked', false);
        // }

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
                    if (reason.status === 401 || reason.status === 403) {
                        // localStorage.clear();
                        window.location.href = "/auth/login";
                    }
                });
            }
        });
    }
});

export default Ember.Test.registerAsyncHelper('stubSession', function(app, test, attrs={}) {
    test.register('service:session', Session.extend(attrs));
});
