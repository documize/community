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
import $ from 'jquery';
import { htmlSafe } from '@ember/string';
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import NotifierMixin from '../../../mixins/notifier';
import SectionMixin from '../../../mixins/section';
import Component from '@ember/component';

export default Component.extend(SectionMixin, NotifierMixin, {
	sectionService: service('section'),
	isDirty: false,
	busy: false,
	authenticated: false,
	boards: null,
	noBoards: false,
	appKey: "",
	trelloConfigured: computed('appKey', function () {
		return !_.isEmpty(this.get('appKey'));
	}),

	boardStyle: computed('config.board', function () {
		let board = this.get('config.board');

		if (_.isNull(board) || _.isUndefined(board)) {
			return "#4c4c4c";
		}

		let color = board.prefs.backgroundColor;
		return htmlSafe("background-color: " + color);
	}),

	init() {
		this._super(...arguments);
		this.config = {};
	},

	didReceiveAttrs() {
		this._super();

		let page = this.get('page');
		let config = {};
		let self = this;

		try {
			config = JSON.parse(this.get('meta.config'));
		} catch (e) {} // eslint-disable-line no-empty

		if (_.isEmpty(config)) {
			config = {
				token: "",
				user: null,
				board: null,
				lists: []
			};
		}

		this.set('config', config);

		this.get('sectionService').fetch(page, "config", {})
			.then(function (s) {
				self.set('appKey', s.appKey);
				self.set('config.token', s.token); // the user's own token has been stored in the DB

				// On auth callback capture user token
				let hashToken = window.location.hash;
				if (!_.isUndefined(hashToken) && !_.isNull(hashToken)) {
					let token = hashToken.replace("#token=", "");
					if (!_.isEmpty(token)) {
						self.set('config.token', token);
					}
				}

				if (self.get('appKey') !== "" && self.get('config.token') !== "") {
					self.send('auth');
				} else {
					$.getScript("https://api.trello.com/1/client.js?key=" + self.get('appKey'), function () {
						Trello.deauthorize();
					});
				}
			}, function (error) {
				console.log(error); // eslint-disable-line no-console
			});
	},

	getBoardLists() {
		this.set('busy', true);

		let self = this;
		let boards = this.get('boards');
		let board = this.get('config.board');
		let page = this.get('page');

		if (_.isNull(boards) || _.isUndefined(boards) || boards.length === 0) {
			this.set('noBoards', true);
			return;
		}

		this.set('noBoards', false);

		if (_.isNull(board) || _.isUndefined(board)) {
			if (boards.length) {
				board = boards[0];
				this.set('config.board', board);
			}
		} else {
			this.set('config.board', boards.findBy('id', board.id));
		}

		this.get('sectionService').fetch(page, "lists", self.get('config'))
			.then(function (lists) {
				let savedLists = self.get('config.lists');
				if (savedLists === null) {
					savedLists = [];
				}

				lists.forEach(function (list) {
					let saved = savedLists.findBy("id", list.id);
					let included = true;
					if (!_.isUndefined(saved)) {
						included = saved.included;
					}
					list.included = included;
				});

				self.set('config.lists', lists);
				self.set('busy', false);
			}, function (error) { //jshint ignore: line
				self.set('busy', false);
				self.set('authenticated', false);
				console.log("Unable to fetch board lists"); // eslint-disable-line no-console
				console.log(error); // eslint-disable-line no-console
			});
	},

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		onListCheckbox(id) {
			let lists = this.get('config.lists');
			let list = lists.findBy('id', id);

			if (list !== null) {
				set(list, 'included', !list.included);
			}
		},

		auth() {
			if (this.get('appKey') === "") {
				$("#trello-appkey").addClass('error').focus();
				this.set('authenticated', false);
				return;
			}

			let self = this;
			let page = this.get('page');

			self.set('busy', true);

			$.getScript("https://api.trello.com/1/client.js?key=" + this.get('appKey'), function () {
				Trello.authorize({
					type: "redirect",
					interactive: true,
					name: "Documize",
					scope: {
						read: true,
						write: false
					},
					expiration: "never",
					persist: true,
					success: function () {
						self.set('authenticated', true);
						self.set('config.token', Trello.token());
						self.set('busy', true);

						Trello.members.get("me", function (user) {
							self.set('config.user', user);
						}, function (error) {
							console.log(error); // eslint-disable-line no-console
						});

						self.get('sectionService').fetch(page, "boards", self.get('config'))
							.then(function (boards) {
								self.set('busy', false);
								self.set('boards', boards);
								self.getBoardLists();
							}, function (error) { //jshint ignore: line
								self.set('busy', false);
								self.set('authenticated', false);
								console.log("Unable to fetch boards"); // eslint-disable-line no-console
								console.log(error); // eslint-disable-line no-console
							});
					},
					error: function (error) {
						self.set('busy', false);
						self.set('authenticated', false);
						console.log(error); // eslint-disable-line no-console
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
			let cb = this.get('onCancel');
			cb();
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
				.then(function (response) {
					meta.set('rawBody', JSON.stringify(response));
					self.set('busy', false);
					self.attrs.onAction(page, meta);
				}, function (reason) { // eslint-disable-line no-unused-vars
					self.set('busy', false);
					self.attrs.onAction(page, meta);
				});
		}
	}
});
