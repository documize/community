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

/*global Trello*/
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
    boards: null,

    boardStyle: Ember.computed('config.board', function() {
        var color = this.get('config.board').prefs.backgroundColor;
        return Ember.String.htmlSafe("background-color: " + color);
    }),

    didReceiveAttrs() {
        let config = {};

        try {
            config = JSON.parse(this.get('meta.config'));
        }
        catch (e) {}

        if (is.empty(config)) {
            config = {
                appKey: "",
                token: "",
                user: null,
                board: null,
                lists: []
            };
        }

        this.set('config', config);

        if (this.get('config.appKey') !== "" && this.get('config.token') !== "") {
            this.send('auth');
        }
    },

    willDestroyElement() {
        this.destroyTooltips();
    },

    getBoardLists() {
        this.set('busy', true);

        let self = this;
        let boards = this.get('boards');
        let board = this.get('config.board');
        let page = this.get('page');

        if (is.null(board) || is.undefined(board)) {
            if (boards.length) {
                board = boards[0];
                this.set('config.board', board);
            }
        }
        else {
            this.set('config.board', boards.findBy('id', board.id));
        }

        this.get('sectionService').fetch(page, "lists", self.get('config'))
            .then(function(lists) {
                let savedLists = self.get('config.lists');
                if (savedLists === null) {
                    savedLists = [];
                }

                lists.forEach(function(list) {
                    let saved = savedLists.findBy("id", list.id);
                    let included = true;
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
                self.showNotification("Unable to fetch board lists");
                console.log(error);
            });
    },

    actions: {
        isDirty() {
            return this.get('isDirty');
        },

        getAppKey() {
            window.open("https://trello.com/app-key", "Trello App Key", "");
        },

        onListCheckbox(id) {
            let lists = this.get('config.lists');
            let list = lists.findBy('id', id);

            if (list !== null) {
                Ember.set(list, 'included', !list.included);
            }
        },

        logout() {
            Trello.deauthorize();
            this.set('authenticated', false);
            this.set('token', '');
        },

        auth() {
            if (this.get('config.appKey') === "") {
                $("#trello-appkey").addClass('error').focus();
                this.set('authenticated', false);
                return;
            }

            let self = this;
            let page = this.get('page');

            self.set('busy', true);

            Ember.$.getScript("https://api.trello.com/1/client.js?key=" + this.get('config.appKey'), function() {
                Trello.authorize({
                    type: "popup",
                    // interactive: false,
                    name: "Documize",
                    scope: {
                        read: true,
                        write: false
                    },
                    expiration: "never",
                    persist: true,
                    success: function() {
                        self.set('authenticated', true);
                        self.set('config.token', Trello.token());
                        self.set('busy', true);

                        Trello.members.get("me", function(user) {
                            self.set('config.user', user);
                        }, function(error) {
                            console.log(error);
                        });

                        self.get('sectionService').fetch(page, "boards", self.get('config'))
                            .then(function(boards) {
                                self.set('busy', false);
                                self.set('boards', boards);
                                self.getBoardLists();
                            }, function(error) { //jshint ignore: line
                                self.set('busy', false);
                                self.set('authenticated', false);
                                self.showNotification("Unable to fetch boards");
                                console.log(error);
                            });
                    },
                    error: function(error) {
                        self.set('busy', false);
                        self.set('authenticated', false);
                        self.showNotification("Unable to authenticate");
                        console.log(error);
                    }
                });
            });
        },

        onBoardChange(board) {
            this.set('isDirty', true);
            this.set('config.board', board);
            this.set('config.lists', []);
            this.getBoardLists();
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

            this.get('sectionService').fetch(page, "cards", this.get('config'))
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

// app key really required?
// pass/save global section config?
