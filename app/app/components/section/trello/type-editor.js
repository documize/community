/*global Trello*/
import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';
import TooltipMixin from '../../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
    sectionService: Ember.inject.service('section'),
    isDirty: false,
    waiting: false,
    authenticated: false,
    config: {
        appKey: "",
        board: null,
        list: null,
        cards: null
    },
    boards: null,
    lists: null,

    hasAppKey: function() {
        console.log(is.not.empty(this.get('config.appKey')));
        return is.empty(this.get('config.appKey')) ? false : true;
    }.property('config'),

    didReceiveAttrs() {},

    willDestroyElement() {
        this.destroyTooltips();
    },

    getBoardLists() {
        let self = this;
        let board = this.get('config.board');

        Trello.get(`boards/${board.id}/lists/open`,
            function(lists) {
                self.set('lists', lists);

                if (lists.length) {
                    self.set('config.list', lists[0]);
                }

                self.getListCards();
            });
    },

    getListCards() {
        let self = this;
        let list = this.get('config.list');

        Trello.get(`lists/${list.id}/cards`,
            function(cards) {
                self.set('config.cards', cards);
                console.log(cards);
            });
    },

    actions: {
        isDirty() {
            return this.get('isDirty');
        },

        getAppKey() {
            window.open("https://trello.com/app-key", "Trello App Key", "");
        },

        getAuthToken() {
            let appKey = this.get('config.appKey');
            let self = this;

            if (is.empty(appKey)) {
                $("#trello-appkey").addClass("error").focus();
                return;
            }

            Ember.$.getScript("https://api.trello.com/1/client.js?key=" + appKey, function() {
                Trello.authorize({
                    type: "popup",
                    name: "Documize",
                    scope: {
                        read: true,
                        write: false
                    },
                    expiration: "never",
                    persist: true,
                    success: function() {
                        self.set('authenticated', true);
                        Trello.get("members/me/boards?fields=id,name,url,closed,prefs,idOrganization",
                            function(boards) {
                                self.set('boards', boards.filterBy("closed", false));
                                let board = boards.length ? boards[0] : null;
                                self.set('config.board', board);
                                self.getBoardLists();
                            });

                        Trello.get("members/me/organizations",
                            function(orgs) {
                                self.set('orgs', orgs);
                                console.log(orgs);
                            });

                    },
                    error: function(error) {
                        self.showNotification("Unable to authenticate");
                        console.log(error);
                    }
                });
            });
        },

        onBoardChange(board) {
            this.set('config.board', board);
            this.getBoardLists();
        },

        onListChange(list) {
            this.set('config.list', list);
            this.getListCards();
        },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');
            page.set('title', title);

            this.attrs.onAction(page, meta);
        }
    }
});