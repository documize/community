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

import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NotifierMixin from '../../../mixins/notifier';
import SectionMixin from '../../../mixins/section';

export default Component.extend(SectionMixin, NotifierMixin, {
	sectionService: service('section'),
	isDirty: false,
	waiting: false,
	authenticated: false,

	init() {
		this._super(...arguments);
		this.config = {};
		this.items = {};
	},

	didReceiveAttrs() {
		this._super();
		let config = {};

		try {
			config = JSON.parse(this.get('meta.config'));
		} catch (e) {} // eslint-disable-line no-empty

		if (_.isEmpty(config)) {
			config = {
				APIToken: "",
				query: "",
				max: 10,
				group: null,
				system: null
			};
		}

		this.set('config', config);

		this.send('auth');
	},

	displayError(reason) {
		console.log(reason); // eslint-disable-line no-console
	},

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		auth() {
			let page = this.get('page');
			let config = this.get('config');
			let self = this;

			this.set('waiting', true);

			this.get('sectionService').fetch(page, "auth", config)
				.then(function (response) {
					self.set('authenticated', true);
					self.set('items', response);
					self.set('config.APIToken', '********'); // reset the api token once it has been sent to the host

					self.get('sectionService').fetch(page, "options", config)
						.then(function (response) {
							self.set('options', response);
							self.set('waiting', false);

							let options = self.get('options');
							let group = {};
							if (!_.isNull(config.group)) {
								group = _.find(options.groups, { id: config.group.id });
							} else {
								group = options.groups[0];
							}
							if (!_.isUndefined(group)) {
								set(config, 'group', group);
							}
						}, function (reason) {
							self.set('authenticated', false);
							self.set('waiting', false);
							self.set('config.APIToken', ''); // clear the api token
							self.displayError(reason);
							console.log("get options call failed"); // eslint-disable-line no-console
						});
				}, function (reason) {
					self.set('authenticated', false);
					self.set('waiting', false);
					self.set('config.APIToken', ''); // clear the api token
					self.displayError(reason);
					console.log("auth token invalid"); // eslint-disable-line no-console
				});
		},

		onGroupsChange(group) {
			let config = this.get('config');
			let page = this.get('page');
			let self = this;
			this.set('isDirty', true);
			this.set('config.group', group);
			this.set('waiting', true);

			this.get('sectionService').fetch(page, "auth", config)
				.then(function (response) {
					self.set('waiting', false);
					self.set('items', response);
				}, function (reason) { //jshint ignore: line
					self.set('waiting', false);
					self.displayError(reason);
				});
		},

		onSystemsChange(system) {
			let config = this.get('config');
			let page = this.get('page');
			let self = this;
			this.set('isDirty', true);
			this.set('config.system', system);
			this.set('waiting', true);

			this.get('sectionService').fetch(page, "auth", config)
				.then(function (response) {
					self.set('waiting', false);
					self.set('items', response);
				}, function (reason) { //jshint ignore: line
					self.set('waiting', false);
					self.displayError(reason);
				});
		},

		onCancel() {
			let cb = this.get('onCancel');
			cb();
		},

		onAction(title) {
			let self = this;
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('externalSource', true);

			let config = this.get('config');
			let max = 10;
			if (_.isNumber(parseInt(config.max))) {
				max = parseInt(config.max);
			}

			set(config, 'max', max);
			this.set('waiting', true);

			this.get('sectionService').fetch(page, "auth", this.get('config'))
				.then(function (response) {
					self.set('items', response);
					let items = self.get('items');

					if (items.events.length > max) {
						items.events = items.events.slice(0, max);
					}

					meta.set('config', JSON.stringify(config));
					meta.set('rawBody', JSON.stringify(items));

					self.set('waiting', false);
					self.attrs.onAction(page, meta);
				}, function (reason) { // eslint-disable-line no-unused-vars
					self.set('authenticated', false);
					self.set('waiting', false);
					console.log(reason); // eslint-disable-line no-console
				});
		}
	}
});
