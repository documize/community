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
import NotifierMixin from '../../../mixins/notifier';
import TooltipMixin from '../../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
    sectionService: Ember.inject.service('section'),
    isDirty: false,
    waiting: false,
    authenticated: false,
    user: {},
    workspaces: [],
    config: {},

    fieldEditable: function() {
        if (this.get('page.userId') !== this.session.user.id) {
            return "readonly";
        } else {
            return undefined;
        }
    }.property('config'),

    didReceiveAttrs() {
        let config = {};

        try {
            config = JSON.parse(this.get('meta.config'));
        } catch (e) {}

        if (is.empty(config)) {
            config = {
                APIKey: "",
                filter: {},
                itemCount: 0,
                url: "",
                userId: 0,
                username: "",
                workspaceId: 0,
                workspaceName: "",
            };
        }

        this.set('config', config);

        if (this.get('config.userId') > 0) {
            this.send('auth');
        }
    },

    willDestroyElement() {
        this.destroyTooltips();
    },

    getWorkspaces() {
        let page = this.get('page');
        let self = this;
        this.set('waiting', true);

        this.get('sectionService').fetch(page, "workspace", this.get('config'))
            .then(function(response) {
                // console.log(response);
                let workspaceId = self.get('config.workspaceId');

                if (response.length > 0 && workspaceId === 0) {
                    workspaceId = response[0].Id;
                }

                self.set("config.workspaceId", workspaceId);
                self.set('workspaces', response);
                self.selectWorkspace(workspaceId);

                Ember.run.schedule('afterRender', function() {
                    window.scrollTo(0, document.body.scrollHeight);

                    response.forEach(function(workspace) {
                        self.addTooltip(document.getElementById("gemini-workspace-" + workspace.Id));
                    });
                });
                self.set('waiting', false);
            }, function(reason) { //jshint ignore: line
                self.set('workspaces', []);
                self.set('waiting', false);
            });
    },

    getItems() {
        let page = this.get('page');
        let self = this;

        this.set('waiting', true);

        this.get('sectionService').fetch(page, "items", this.get('config'))
            .then(function(response) {
                // console.log(response);
                self.set('items', response);
                self.set('config.itemCount', response.length);
                self.set('waiting', false);
            }, function(reason) { //jshint ignore: line
                self.set('items', []);
                self.set('waiting', false);
            });
    },

    selectWorkspace(id) {
        let self = this;
        let w = this.get('workspaces');

        w.forEach(function(w) {
            Ember.set(w, 'selected', w.Id === id);

            if (w.Id === id) {
                self.set("config.filter", w.Filter);
                self.set("config.workspaceId", id);
                self.set("config.workspaceName", w.Title);
                // console.log(self.get('config'));
            }
        });

        this.set('workspaces', w);
        this.getItems();
    },

    actions: {
        isDirty() {
            return this.get('isDirty');
        },

        auth() {
            // missing data?
            if (is.empty(this.get('config.url'))) {
                $("#gemini-url").addClass("error").focus();
                return;
            }
            if (is.empty(this.get('config.username'))) {
                $("#gemini-username").addClass("error").focus();
                return;
            }
            if (is.empty(this.get('config.APIKey'))) {
                $("#gemini-apikey").addClass("error").focus();
                return;
            }

            // knock out spaces
            this.set('config.url', this.get('config.url').trim());
            this.set('config.username', this.get('config.username').trim());
            this.set('config.APIKey', this.get('config.APIKey').trim());

            // remove trailing slash in URL
            let url = this.get('config.url');
            if (url.indexOf("/", url.length - 1) !== -1) {
                this.set('config.url', url.substring(0, url.length - 1));
            }

            let page = this.get('page');
            let self = this;

            this.set('waiting', true);

            this.get('sectionService').fetch(page, "auth", this.get('config'))
                .then(function(response) {
                    self.set('authenticated', true);
                    self.set('user', response);
                    self.set('config.userId', response.BaseEntity.id);
                    self.set('waiting', false);
                    self.getWorkspaces();
                }, function(reason) { //jshint ignore: line
                    self.set('authenticated', false);
                    self.set('user', null);
                    self.set('config.userId', 0);
                    self.set('waiting', false);

                    switch (reason.status) {
                        case 400:
                            self.showNotification(`Unable to connect to Gemini URL`);
                            break;
                        case 403:
                            self.showNotification(`Unable to authenticate`);
                            break;
                        default:
                            self.showNotification(`Something went wrong, try again!`);
                    }
                });
        },

        onWorkspaceChange(id) {
            this.set('isDirty', true);
            this.selectWorkspace(id);
        },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');
            page.set('title', title);
            meta.set('rawBody', JSON.stringify(this.get("items")));
            meta.set('config', JSON.stringify(this.get('config')));
            meta.set('externalSource', true);

            this.attrs.onAction(page, meta);
        }
    }
});