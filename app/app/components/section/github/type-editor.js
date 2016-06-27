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
    owners: null,
    repos: null,
    noRepos: false,
    showCommits: false,
    showIssueNum: false,

    didReceiveAttrs() {
        let self = this;
        let page = this.get('page');

        if (is.undefined(this.get('config.clientId')) || is.undefined(this.get('config.callbackUrl'))) {
            self.get('sectionService').fetch(page, "config", {})
                .then(function(cfg) {
                    let config = {};

                    config = {
                        clientId: cfg.clientID,
                        callbackUrl: cfg.authorizationCallbackURL,
                        token: "",
                        owner: null,
                        owner_name: "",
                        repo: null,
                        repo_name: "",
                        report: null,
                        lists: [],
                        branch: "",
                        branchURL: "",
                        branchSince: "",
                        branchLines: 30,
                        issueNum: "1"
                    };

                    try {
                        let metaConfig = JSON.parse(self.get('meta.config'));
                        config.owner = metaConfig.owner;
                        config.repo = metaConfig.repo;
                        config.report = metaConfig.report;
                        config.lists = metaConfig.lists;
                    } catch (e) {}

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


    getOwnerLists() {
        this.set('busy', true);

        let self = this;
        let owners = this.get('owners');
        let thisOwner = this.get('config.owner');
        let page = this.get('page');

        console.log("owner", thisOwner);

        if (is.null(thisOwner) || is.undefined(thisOwner)) {
            if (owners.length) {
                thisOwner = owners[0];
                this.set('config.owner', thisOwner);
            }
        } else {
            this.set('config.owner', owners.findBy('id', thisOwner.id));
        }

        this.set('owner', thisOwner);

        this.get('sectionService').fetch(page, "repos", self.get('config'))
            .then(function(lists) {
                self.set('busy', false);
                self.set('repos', lists);
                self.getRepoLists();
            }, function(error) { //jshint ignore: line
                self.set('busy', false);
                self.set('authenticated', false);
                self.showNotification("Unable to fetch repositories");
                console.log(error);
            });
    },

    getRepoLists() {
        this.set('busy', true);

        let repos = this.get('repos');
        let thisRepo = this.get('config.repo');

        console.log("repo", thisRepo);

        if (is.null(repos) || is.undefined(repos) || repos.length === 0) {
            this.set('noRepos', true);
            return;
        }

        this.set('noRepos', false);

        if (is.null(thisRepo) || is.undefined(thisRepo) || thisRepo.owner !== this.get('config.owner').name) {
            if (repos.length) {
                thisRepo = repos[0];
                this.set('config.repo', thisRepo);
            }
        } else {
            this.set('config.repo', repos.findBy('id', thisRepo.id));
        }

        this.set('repo', thisRepo);

        this.getReportLists();
    },


    getReportLists() {
        let reports = [];
        reports[0] = {
            id: "commits_data", // used as method for fetching Go data
            name: "Commits on a branch"
        };
        reports[1] = {
            id: "issues_data", // used as method for fetching Go data
            name: "Open Issues"
        };
        reports[2] = {
            id: "issuenum_data", // used as method for fetching Go data
            name: "Individual issue activity"
        };

        this.set("reports", reports);

        let thisReport = this.get('config.report');

        console.log("report", thisReport);

        if (is.null(thisReport) || is.undefined(thisReport)) {
            thisReport = reports[0];
            this.set('config.report', thisReport);
        } else {
            this.set('config.report', reports.findBy('id', thisReport.id));
        }

        this.set('report', thisReport);

        this.renderSwitch(thisReport);

    },

    renderSwitch(thisReport) {
        this.set('showCommits', false);
        this.set('showIssueNum', false);
        switch (thisReport.id) {
            case 'commits_data':
                this.set('showCommits', true);
                this.getBranchLists();
                break;
            case "issues_data":
                // nothing to show yet
                this.set('busy', false);
                break;
            case "issuenum_data":
                this.set('showIssueNum', true);
                this.set('busy', false);
                break;
        }
    },

    getBranchLists() {
        this.set('busy', true);

        console.log("branches");

        let self = this;
        let page = this.get('page');

        this.get('sectionService').fetch(page, "branches", self.get('config'))
            .then(function(lists) {
                let savedLists = self.get('config.lists');
                if (savedLists === null) {
                    savedLists = [];
                }

                if (lists.length > 0) {
                    let noIncluded = true;

                    lists.forEach(function(list) {
                        let saved = savedLists.findBy("id", list.id);
                        let included = false;
                        if (is.not.undefined(saved)) {
                            included = saved.included;
                            noIncluded = false;
                        }
                        list.included = included;
                    });

                    if (noIncluded) {
                        lists[0].included = true; // make the first entry the default
                    }
                }

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

            self.get('sectionService').fetch(page, "owners", self.get('config'))
                .then(function(owners) {
                    self.set('busy', false);
                    self.set('owners', owners);
                    self.getOwnerLists();
                }, function(error) { //jshint ignore: line
                    self.set('busy', false);
                    self.set('authenticated', false);
                    self.showNotification("Unable to fetch owners");
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

        onOwnerChange(thisOwner) {
            this.set('isDirty', true);
            this.set('config.owner', thisOwner);
            this.set('config.repos', []);
            this.set('config.lists', []);
            this.getOwnerLists();
        },

        onRepoChange(thisRepo) {
            this.set('isDirty', true);
            this.set('config.repo', thisRepo);
            this.set('config.lists', []);
            this.getRepoLists();
        },

        onReportChange(thisReport) {
            this.set('isDirty', true);
            this.set('config.report', thisReport);
            this.getReportLists();
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

            let thisReport = this.get('config.report');
            this.get('sectionService').fetch(page, thisReport.id, this.get('config'))
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