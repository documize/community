/*global Trello*/
import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';
import TooltipMixin from '../../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
    sectionService: Ember.inject.service('section'),
    isDirty: false,
    waiting: false,
    authenticated: false,
    config: {},
    boards: null,
    lists: null,

    didReceiveAttrs() {
        let config = {};

        try {
            config = JSON.parse(this.get('meta.config'));
        } catch (e) {}

        if (is.empty(config)) {
            config = {
                appKey: "",
                token: "",
                board: null,
                list: null,
                cards: null
            };
        }

        this.set('config', config);

        if (this.get('config.appKey') !== "" &&
            this.get('config.token') !== "") {
            this.send('auth');
        }
    },

    willDestroyElement() {
        this.destroyTooltips();
    },

    getBoardLists() {
        let self = this;
        let boards = this.get('boards');
        let board = this.get('config.board');
        this.set('waiting', true);

        if (board === null) {
            if (boards.length) {
                board = boards[0];
                this.set('config.board', board);
            }
        } else {
            this.set('config.board', boards.findBy('id', board.id));
        }

        Trello.get(`boards/${board.id}/lists/open`,
            function(lists) {
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
                self.set('waiting', false);

                // self.getListCards();
            });
    },

    // getListCards() {
    //     let self = this;
    //     let list = this.get('config.list');

    //     Trello.get(`lists/${list.id}/cards`,
    //         function(cards) {
    //             self.set('config.cards', cards);
    //             console.log(cards);
    //         });
    // },

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

        auth() {
            if (this.get('config.appKey') === "") {
                $("#trello-appkey").addClass('error').focus();
                this.set('authenticated', false);
                return;
            }

            let self = this;
            self.set('waiting', true);

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
                        Trello.get("members/me/boards?fields=id,name,url,closed,prefs,idOrganization",
                            function(boards) {
                                self.set('waiting', false);
                                self.set('boards', boards.filterBy("closed", false));
                                self.getBoardLists();
                            });
                    },
                    error: function(error) {
                        self.set('waiting', false);
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

        // onListChange(list) {
        //     this.set('config.list', list);
        //     this.getListCards();
        // },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');
            page.set('title', title);
            // meta.set('rawBody', JSON.stringify(this.get("items")));
            meta.set('rawBody', '');
            meta.set('config', JSON.stringify(this.get('config')));
            meta.set('externalSource', true);

            this.attrs.onAction(page, meta);
        }
    }
});