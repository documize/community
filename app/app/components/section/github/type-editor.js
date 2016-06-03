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
import SectionMixin from '../../../mixins/section';

export default Ember.Component.extend(SectionMixin, NotifierMixin, TooltipMixin, {
    sectionService: Ember.inject.service('section'),
    isDirty: false,
    busy: false,
    authenticated: false,
    config: {},
    repos: null,
    noRepos: false,

    didReceiveAttrs() {

        let self = this;
        let page = this.get('page');

        if (is.undefined(this.get('config.clientId')) || is.undefined(this.get('config.callbackUrl'))) {
            self.get('sectionService').fetch(page, "config", {})
                .then(function(cfg) {
                    let config = {};

                    try {
                        config = JSON.parse(self.get('meta.config'));
                    } catch (e) {}

                    config = {
                        clientId: cfg.clientID,
                        callbackUrl: cfg.authorizationCallbackURL,
                        token: "",
                        repo: null,
                        lists: [],
                        owner: "",
                        repo_name: "",
                        branch: "",
                        branchURL: "",
                        branchSince: "",
                        branchLines: 30
                    };
                    self.set('config', config);

                    // On auth callback capture code
                    let code = window.location.search;

                    if (is.not.undefined(code) && is.not.null(code)) {
                        let tok = code.replace("?code=", "");
                        if (is.not.empty(code)) {
                            self.set('config.token', tok);
                            self.send('authStage2');
                        }
                    } else {
                        if (self.get('config.token') === "") {
                            self.send('auth');
                        }
                    }
                }, function(error) { //jshint ignore: line
                    console.log(error);
                });
        }
    },

    willDestroyElement() {
        this.destroyTooltips();
    },

    getRepoLists() {
        this.set('busy', true);

        let self = this;
        let repos = this.get('repos');
        let thisRepo = this.get('config.repo');
        let page = this.get('page');

        if (is.null(repos) || is.undefined(repos) || repos.length === 0) {
            this.set('noRepos', true);
            return;
        }

        this.set('noRepos', false);

        if (is.null(thisRepo) || is.undefined(thisRepo)) {
            if (repos.length) {
                thisRepo = repos[0];
                this.set('config.repo', thisRepo);
            }
        } else {
            this.set('config.repo', repos.findBy('id', thisRepo.id));
        }

        this.get('sectionService').fetch(page, "lists", self.get('config'))
            .then(function(lists) {
                let savedLists = self.get('config.lists');
                if (savedLists === null) {
                    savedLists = [];
                }

                lists.forEach(function(list) {
                    let saved = savedLists.findBy("id", list.id);
                    let included = false;
                    if (is.not.undefined(saved)) {
                        included = saved.included;
                    }
                    list.included = included;
                });

                self.set('config.lists', lists);
                self.set('busy', false);
            }, function(error) { //jshint ignore: line
                self.set('busy', false);
                self.set('authenticated', false);
                self.showNotification("Unable to fetch repository branches");
                console.log(error);
            });
    },

    actions: {
        isDirty() {
            return this.get('isDirty');
        },

        onListCheckbox(id) {
            let lists = this.get('config.lists');
            let list = lists.findBy('id', id);

            // restore the list of branches to the default state
            lists.forEach(function(lst) {
                Ember.set(lst, 'included', false);
            });

            if (list !== null) {
                Ember.set(list, 'included', !list.included);
            }
        },

        authStage2() {
            let self = this;
            self.set('authenticated', true);
            self.set('busy', true);
            let page = this.get('page');

            self.get('sectionService').fetch(page, "repos", self.get('config'))
                .then(function(repos) {
                    self.set('busy', false);
                    self.set('repos', repos);
                    self.getRepoLists();
                }, function(error) { //jshint ignore: line
                    self.set('busy', false);
                    self.set('authenticated', false);
                    self.showNotification("Unable to fetch repos");
                    console.log(error);
                });

        },

        auth() {

            let self = this;
            self.set('busy', true);
            self.set('authenticated', false);
            let target = "https://github.com/login/oauth/authorize?client_id=" + self.get('config.clientId') +
                "&scope=repo&redirect_uri=" + encodeURIComponent(self.get('config.callbackUrl')) +
                "&state=" + encodeURIComponent(window.location.href);
            window.location.href = target;

        },

        onRepoChange(thisRepo) {
            this.set('isDirty', true);
            this.set('config.repo', thisRepo);
            this.set('config.lists', []);
            this.getRepoLists();
        },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction(title) {
            this.set('busy', true);

            let self = this;
            let page = this.get('page');
            let meta = this.get('meta');
            page.set('title', title);
            meta.set('rawBody', '');
            meta.set('config', JSON.stringify(this.get('config')));
            meta.set('externalSource', true);

            this.get('sectionService').fetch(page, "commits", this.get('config'))
                .then(function(response) {
                    meta.set('rawBody', JSON.stringify(response));
                    self.set('busy', false);
                    self.attrs.onAction(page, meta);
                }, function(reason) { //jshint ignore: line
                    self.set('busy', false);
                    self.attrs.onAction(page, meta);
                });
        }
    }
});