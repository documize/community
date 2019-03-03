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

import $ from 'jquery';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NotifierMixin from '../../../mixins/notifier';
import SectionMixin from '../../../mixins/section';

export default Component.extend(SectionMixin, NotifierMixin, {
	sectionService: service('section'),
	isDirty: false,
	busy: false,
	authenticated: false,
	owners: null,

	init() {
		this._super(...arguments);
		this.config = {};
	},

	didReceiveAttrs() {
		let self = this;
		let page = this.get('page');

		if (_.isUndefined(this.get('config.clientId')) || _.isUndefined(this.get('config.callbackUrl'))) {
			self.get('sectionService').fetch(page, "config", {})
			.then(function (cfg) {
				let config = {};

				config = {
					clientId: cfg.clientID,
					callbackUrl: cfg.authorizationCallbackURL,
					owner: null,
					owner_name: "",
					lists: [],
					branchSince: "",
					branchLines: "100",
					userId: "",
					pageId: page.get('id'),
					showMilestones: false,
					showIssues: false,
					showCommits: true,
				};

				try {
					let metaConfig = JSON.parse(self.get('meta.config'));
					config.owner = metaConfig.owner;
					config.lists = metaConfig.lists;
					config.branchSince = metaConfig.branchSince;
					config.userId = metaConfig.userId;
					config.pageId = metaConfig.pageId;
					config.showMilestones = metaConfig.showMilestones;
					config.showIssues = metaConfig.showIssues;
					config.showCommits = metaConfig.showCommits;
				} catch (e) { // eslint-disable-line no-empty
				}

				if (_.isUndefined(config.showCommits)) {
					config.showCommits = true;
				}

				self.set('config', config);
				self.set('config.pageId', page.get('id'));

				// On auth callback capture code
				let code = window.location.search;
				code = code.replace("?mode=edit", "");

				if (!_.isUndefined(code) && !_.isNull(code) && !_.isEmpty(code) && code !== "") {
					let tok = code.replace("&code=", "");
					self.get('sectionService').fetch(page, "saveSecret", { "token": tok })
						.then(function () {
							self.send('authStage2');
						}, function (error) { //jshint ignore: line
							console.log(error); // eslint-disable-line no-console
							self.send('auth');
						});
				} else {
					if (config.userId !== self.get("session.session.authenticated.user.id")) {
						console.log("github auth wrong user ID, switching"); // eslint-disable-line no-console
						self.set('config.userId', self.get("session.session.authenticated.user.id"));
					}
					self.get('sectionService').fetch(page, "checkAuth", self.get('config'))
						.then(function () {
							self.send('authStage2');
						}, function (error) {
							console.log(error); // eslint-disable-line no-console
							self.send('auth'); // require auth if the db token is invalid
						});
				}
			}, function (error) {
				console.log(error); // eslint-disable-line no-console
			});
		}
	},

	getOwnerLists() {
		this.set('busy', true);

		let owners = this.get('owners');
		let thisOwner = this.get('config.owner');

		if (_.isNull(thisOwner) || _.isUndefined(thisOwner)) {
			if (owners.length) {
				thisOwner = owners[0];
				this.set('config.owner', thisOwner);
			}
		} else {
			this.set('config.owner', owners.findBy('id', thisOwner.id));
		}

		this.set('owner', thisOwner);

		this.getOrgReposLists();

		if (_.isUndefined(this.get('initDateTimePicker'))) {
			$.datetimepicker.setLocale('en');
			$('#branch-since').datetimepicker();
			this.set('initDateTimePicker', "Done");
		}
	},

	getOrgReposLists() {
		this.set('busy', true);

		let self = this;
		let page = this.get('page');

		this.get('sectionService').fetch(page, "orgrepos", self.get('config'))
			.then(function (lists) {

				let lists2 = A([]);

				lists.forEach((i) => {
					lists2.pushObject(EmberObject.create(i));
				});

				let savedLists = self.get('config.lists');
				if (savedLists === null) {
					savedLists = [];
				}

				if (lists2.length > 0) {
					let noIncluded = true;

					lists2.forEach(function (list) {
						let included = false;
						var saved;
						if (!_.isUndefined(savedLists)) {
							saved = savedLists.findBy("id", list.id);
						}
						if (!_.isUndefined(saved)) {
							included = saved.selected;
							noIncluded = false;
						}
						list.selected = included;
					});

					if (noIncluded) {
						lists2[0].selected = true; // make the first entry the default
					}
				}

				self.set('config.lists', lists2);
				self.set('busy', false);
			}, function (error) {
				self.set('busy', false);
				self.set('authenticated', false);
				console.log(error); // eslint-disable-line no-console
			});
	},

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		authStage2() {
			let self = this;
			self.set('config.userId', self.get("session.session.authenticated.user.id"));
			self.set('authenticated', true);
			self.set('busy', true);
			let page = this.get('page');

			self.get('sectionService').fetch(page, "owners", self.get('config'))
				.then(function (owners) {
					self.set('busy', false);
					self.set('owners', owners);
					self.getOwnerLists();
				}, function (error) {
					self.set('busy', false);
					self.set('authenticated', false);
					console.log("Unable to fetch owners"); // eslint-disable-line no-console
					console.log(error); // eslint-disable-line no-console
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
			this.set('config.lists', []);
			this.getOwnerLists();
		},

		onStateChange(thisState) {
			this.set('config.state', thisState);
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

			this.get('sectionService').fetch(page, 'content', this.get('config'))
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
