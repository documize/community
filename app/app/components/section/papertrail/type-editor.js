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
import netUtil from '../../../utils/net';

export default Ember.Component.extend(SectionMixin, NotifierMixin, TooltipMixin, {
	sectionService: Ember.inject.service('section'),
	isDirty: false,
	waiting: false,
	authenticated: false,
	config: {},
	items: {},

	didReceiveAttrs() {
		let config = {};

		try {
			config = JSON.parse(this.get('meta.config'));
		} catch (e) {}

		if (is.empty(config)) {
			config = {
				APIToken: "",
				query: "",
				max: 10,
				group: null,
				system: null
			};
		}

		this.set('config', config);

		if (this.get('config.APIToken').length > 0) {
			this.send('auth');
		}
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	displayError(reason) {
		if (netUtil.isAjaxAccessError(reason)) {
			this.showNotification(`Unable to authenticate`);
		} else {
			this.showNotification(`Something went wrong, try again!`);
		}
	},

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		auth() {
			// missing data?
			this.set('config.APIToken', this.get('config.APIToken').trim());

			if (is.empty(this.get('config.APIToken'))) {
				$("#papertrail-apitoken").addClass("error").focus();
				console.log("auth token empty");
				return;
			}

			let page = this.get('page');
			let config = this.get('config');
			let self = this;

			this.set('waiting', true);

			this.get('sectionService').fetch(page, "auth", config)
				.then(function (response) {
					self.set('authenticated', true);
					self.set('items', response);
					self.set('config.APIToken', '********'); // reset the api token once it has been sent to the host
					console.log("auth token OK");

					self.get('sectionService').fetch(page, "options", config)
						.then(function (response) {
							self.set('options', response);
							self.set('waiting', false);

							let options = self.get('options');
							let group = _.findWhere(options.groups, { id: config.group.id });
							if (is.not.undefined(group)) {
								Ember.set(config, 'group', group);
							}
						}, function (reason) { //jshint ignore: line
							self.set('authenticated', false);
							self.set('waiting', false);
							self.set('config.APIToken', ''); // clear the api token 
							self.displayError(reason);
							console.log("get options call failed");
						});
				}, function (reason) { //jshint ignore: line
					self.set('authenticated', false);
					self.set('waiting', false);
					self.set('config.APIToken', ''); // clear the api token 
					self.displayError(reason);
					console.log("auth token invalid");
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
			this.attrs.onCancel();
		},

		onAction(title) {
			let self = this;
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('externalSource', true);

			let config = this.get('config');
			let max = 10;
			if (is.number(parseInt(config.max))) {
				max = parseInt(config.max);
			}

			Ember.set(config, 'max', max);
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
				}, function (reason) { //jshint ignore: line
					self.set('authenticated', false);
					self.set('waiting', false);
					self.showNotification(`Something went wrong, try again!`);
				});
		}
	}
});