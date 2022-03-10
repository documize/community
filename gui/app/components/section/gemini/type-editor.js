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
import { set } from '@ember/object';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import SectionMixin from '../../../mixins/section';
import Component from '@ember/component';

export default Component.extend(SectionMixin, {
	sectionService: service('section'),
	isDirty: false,
	waiting: false,
	authenticated: false,

	init() {
		this._super(...arguments);
		this.user = {};
		this.workspaces = [];
		this.config = {};
	},

	didReceiveAttrs() {
		this._super();

		let config = {};

		try {
			config = JSON.parse(this.get('meta.config'));
		} catch (e) {} // eslint-disable-line no-empty

		if (_.isEmpty(config)) {
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

		let self = this;
		self.set('waiting', true);
		this.get('sectionService').fetch(this.get('page'), "secrets", this.get('config'))
			.then(function (response) {
				self.set('waiting', false);
				self.set('config.APIKey', response.apikey);
				self.set('config.url', response.url);
				self.set('config.username', response.username);

				if (response.apikey.length > 0 && response.url.length > 0 && response.username.length > 0) {
					self.send('auth');
				}
			}, function (reason) { // eslint-disable-line no-unused-vars
				self.set('waiting', false);
				if (self.get('config.userId') > 0) {
					self.send('auth');
				}
			});
	},

	getWorkspaces() {
		let page = this.get('page');
		let self = this;
		this.set('waiting', true);

		this.get('sectionService').fetch(page, "workspace", this.get('config'))
			.then(function (response) {
				// console.log(response);
				let workspaceId = self.get('config.workspaceId');

				if (response.length > 0 && workspaceId === 0) {
					workspaceId = response[0].Id;
				}

				self.set("config.workspaceId", workspaceId);
				self.set('workspaces', response);
				self.selectWorkspace(workspaceId);

				schedule('afterRender', () => {
					window.scrollTo(0, document.body.scrollHeight);
				});
				self.set('waiting', false);
			}, function (reason) { // eslint-disable-line no-unused-vars
				self.set('workspaces', []);
				self.set('waiting', false);
			});
	},

	getItems() {
		let page = this.get('page');
		let self = this;

		this.set('waiting', true);

		this.get('sectionService').fetch(page, "items", this.get('config'))
			.then(function (response) {
				if (self.get('isDestroyed') || self.get('isDestroying')) {
					return;
				}
				self.set('items', response);
				self.set('config.itemCount', response.length);
				self.set('waiting', false);
			}, function (reason) { // eslint-disable-line no-unused-vars
				if (self.get('isDestroyed') || self.get('isDestroying')) {
					return;
				}
				self.set('items', []);
				self.set('waiting', false);
			});
	},

	selectWorkspace(id) {
		let self = this;
		let w = this.get('workspaces');

		w.forEach(function (w) {
			set(w, 'selected', w.Id === id);

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
			if (_.isEmpty(this.get('config.url'))) {
				$("#gemini-url").addClass("is-invalid").focus();
				return;
			}
			if (_.isEmpty(this.get('config.username'))) {
				$("#gemini-username").addClass("is-invalid").focus();
				return;
			}
			if (_.isEmpty(this.get('config.APIKey'))) {
				$("#gemini-apikey").addClass("is-invalid").focus();
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
				.then(function (response) {
					self.set('authenticated', true);
					self.set('user', response);
					self.set('config.userId', response.BaseEntity.id);
					self.set('waiting', false);
					self.getWorkspaces();
				}, function (reason) { // eslint-disable-line no-unused-vars
					self.set('authenticated', false);
					self.set('user', null);
					self.set('config.userId', 0);
					self.set('waiting', false);
				});
		},

		onWorkspaceChange(id) {
			this.set('isDirty', true);
			this.selectWorkspace(id);
		},

		onCancel() {
			let cb = this.get('onCancel');
			cb();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('rawBody', JSON.stringify(this.get("items")));
			meta.set('config', JSON.stringify(this.get('config')));
			meta.set('externalSource', true);

			let cb = this.get('onAction');
			cb(page, meta);
		}
	}
});
