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
	showLabels: false,

	didReceiveAttrs() {
		let self = this;
		let page = this.get('page');

		if (is.undefined(this.get('config.clientId')) || is.undefined(this.get('config.callbackUrl'))) {
			self.get('sectionService').fetch(page, "config", {})
				.then(function (cfg) {
					let config = {};

					config = {
						clientId: cfg.clientID,
						callbackUrl: cfg.authorizationCallbackURL,
						owner: null,
						owner_name: "",
						repo: null,
						repo_name: "",
						report: null,
						lists: [],
						branch: "",
						branchURL: "",
						branchSince: "",
						branchLines: "30",
						state: null,
						issues: "",
						userId: "",
						pageId: page.get('id'),
					};

					try {
						let metaConfig = JSON.parse(self.get('meta.config'));
						config.owner = metaConfig.owner;
						config.repo = metaConfig.repo;
						config.report = metaConfig.report;
						config.lists = metaConfig.lists;
						config.branchSince = metaConfig.branchSince;
						config.branchLines = metaConfig.branchLines;
						config.state = metaConfig.state;
						config.issues = metaConfig.issues;
						config.userId = metaConfig.userId;
						config.pageId = metaConfig.pageId;
					} catch (e) {}

					self.set('config', config);
					self.set('config.pageId', page.get('id'));

					// On auth callback capture code
					let code = window.location.search;

					if (is.not.undefined(code) && is.not.null(code) && is.not.empty(code) && code !== "") {
						let tok = code.replace("?code=", "");
						self.get('sectionService').fetch(page, "saveSecret", { "token": tok })
							.then(function () {
								console.log("github auth code saved to db");
								self.send('authStage2');
							}, function (error) { //jshint ignore: line
								console.log(error);
								self.send('auth');
							});
					} else {
						if (config.userId !== self.get("session.session.authenticated.user.id")) {
							console.log("github auth wrong user ID, switching");
							self.set('config.userId', self.get("session.session.authenticated.user.id"));
						}
						self.get('sectionService').fetch(page, "checkAuth", self.get('config'))
							.then(function () {
								console.log("github auth code valid");
								self.send('authStage2');
							}, function (error) { //jshint ignore: line
								console.log(error);
								self.send('auth'); // require auth if the db token is invalid
							});
					}
				}, function (error) { //jshint ignore: line
					console.log(error);
				});
		}
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	getOwnerLists() {
		this.set('busy', true);

		//let self = this;
		let owners = this.get('owners');
		let thisOwner = this.get('config.owner');
		//let page = this.get('page');

		if (is.null(thisOwner) || is.undefined(thisOwner)) {
			if (owners.length) {
				thisOwner = owners[0];
				this.set('config.owner', thisOwner);
			}
		} else {
			this.set('config.owner', owners.findBy('id', thisOwner.id));
		}

		this.set('owner', thisOwner);

		/*
		this.get('sectionService').fetch(page, "repos", self.get('config'))
			.then(function (lists) {
				self.set('busy', false);
				self.set('repos', lists);
				self.getRepoLists();
			}, function (error) { //jshint ignore: line
				self.set('busy', false);
				self.set('authenticated', false);
				self.showNotification("Unable to fetch repositories");
				console.log(error);
			});
		*/
		this.getOrgReposLists();

		if (is.undefined(this.get('initDateTimePicker'))) {
			$.datetimepicker.setLocale('en');
			$('#branch-since').datetimepicker();
			this.set('initDateTimePicker', "Done");
		}

	},

	/*
	getRepoLists() {
		this.set('busy', true);

		let repos = this.get('repos');
		let thisRepo = this.get('config.repo');

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
			id: "commitsData", // used as method for fetching Go data
			name: "Commits on a branch"
		};
		reports[1] = {
			id: "issuesData", // used as method for fetching Go data
			name: "Issues"
		};

		this.set("reports", reports);

		let thisReport = this.get('config.report');

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

		if (is.undefined(this.get('initDateTimePicker'))) {
			$.datetimepicker.setLocale('en');
			$('#branch-since').datetimepicker();
			this.set('initDateTimePicker', "Done");
		}

		let bl = this.get('config.branchLines');
		if (is.undefined(bl) || bl === "" || bl <= 0) {
			this.set('config.branchLines', "30");
		}

		this.set('showCommits', false);
		this.set('showLabels', false);
		switch (thisReport.id) {
		case 'commitsData':
			this.set('showCommits', true);
			this.getBranchLists();
			break;
		case 'issuesData':
			this.set('showLabels', true);
			this.getLabelLists();
			break;
		}
	},

	getBranchLists() {
		this.set('busy', true);

		let self = this;
		let page = this.get('page');

		this.get('sectionService').fetch(page, "branches", self.get('config'))
			.then(function (lists) {
				let savedLists = self.get('config.lists');
				if (savedLists === null) {
					savedLists = [];
				}

				if (lists.length > 0) {
					let noIncluded = true;

					lists.forEach(function (list) {
						let included = false;
						var saved;
						if (is.not.undefined(savedLists)) {
							saved = savedLists.findBy("id", list.id);
						}
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
			}, function (error) { //jshint ignore: line
				self.set('busy', false);
				self.set('authenticated', false);
				self.showNotification("Unable to fetch repository branches");
				console.log(error);
			});
	},
	*/

	getOrgReposLists() {
		this.set('busy', true);

		let self = this;
		let page = this.get('page');

		this.get('sectionService').fetch(page, "orgrepos", self.get('config'))
			.then(function (lists) {
				let savedLists = self.get('config.lists');
				if (savedLists === null) {
					savedLists = [];
				}

				if (lists.length > 0) {
					let noIncluded = true;

					lists.forEach(function (list) {
						let included = false;
						var saved;
						if (is.not.undefined(savedLists)) {
							saved = savedLists.findBy("id", list.id);
						}
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
			}, function (error) { //jshint ignore: line
				self.set('busy', false);
				self.set('authenticated', false);
				self.showNotification("Unable to fetch repository branches");
				console.log(error);
			});
	},

	/*
	getLabelLists() {
		this.set('busy', true);

		let self = this;
		let page = this.get('page');

		let states = [];
		states[0] = {
			id: "open",
			name: "Open Issues"
		};
		states[1] = {
			id: "closed",
			name: "Closed Issues"
		};
		states[2] = {
			id: "all",
			name: "All Issues"
		};

		this.set("states", states);

		let thisState = this.get('config.state');

		if (is.null(thisState) || is.undefined(thisState)) {
			thisState = states[0];
			this.set('config.state', thisState);
		} else {
			this.set('config.state', states.findBy('id', thisState.id));
		}

		this.set('state', thisState);

		this.get('sectionService').fetch(page, "labels", self.get('config'))
			.then(function (lists) {
				let savedLists = self.get('config.lists');
				if (savedLists === null) {
					savedLists = [];
				}

				if (lists.length > 0) {
					lists.forEach(function (list) {
						var saved;
						if (is.not.undefined(savedLists)) {
							saved = savedLists.findBy("id", list.id);
						}
						let included = false;
						if (is.not.undefined(saved)) {
							included = saved.included;
						}
						list.included = included;
					});
				}

				self.set('config.lists', lists);
				self.set('busy', false);
			}, function (error) { //jshint ignore: line
				self.set('busy', false);
				self.set('authenticated', false);
				self.showNotification("Unable to fetch repository labels");
				console.log(error);
			});
	},
	*/

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		onListCheckbox(id) {
			let lists = this.get('config.lists');
			let list = lists.findBy('id', id);

			// restore the list of branches to the default state
			//lists.forEach(function (lst) {
			//	Ember.set(lst, 'included', false);
			//});

			if (list !== null) {
				Ember.set(list, 'included', !list.included);
			}
		},

		/*
		onLabelCheckbox(id) {
			let lists = this.get('config.lists');
			let list = lists.findBy('id', id);

			if (list !== null) {
				Ember.set(list, 'included', !list.included);
			}
		},
		*/

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
				}, function (error) { //jshint ignore: line
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

		/*
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
		*/

		onStateChange(thisState) {
			this.set('config.state', thisState);
		},

		onCancel() {
			this.attrs.onCancel();
		},

		onAction(title) {
			this.set('busy', true);

			let thisLines = this.get('config.branchLines');
			if (is.undefined(thisLines) || thisLines === "") {
				this.set('config.branchLines', 30);
			} else if (thisLines < 1) {
				this.set('config.branchLines', 1);
			} else if (thisLines > 100) {
				this.set('config.branchLines', 100);
			}

			let self = this;
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('rawBody', '');
			meta.set('config', JSON.stringify(this.get('config')));
			meta.set('externalSource', true);

			let thisReport = this.get('config.report');
			this.get('sectionService').fetch(page, thisReport.id, this.get('config'))
				.then(function (response) {
					meta.set('rawBody', JSON.stringify(response));
					self.set('busy', false);
					self.attrs.onAction(page, meta);
				}, function (reason) { //jshint ignore: line
					self.set('busy', false);
					self.attrs.onAction(page, meta);
				});
		}
	}
});