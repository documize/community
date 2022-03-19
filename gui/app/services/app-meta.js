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
import { htmlSafe } from '@ember/string';
import { resolve } from 'rsvp';
import miscUtil from '../utils/misc';
import config from '../config/environment';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
	ajax: service(),
	localStorage: service(),
	kcAuth: service(),
	appHost: '',
	apiHost: `${config.apiHost}`,
	endpoint: `${config.apiHost}/${config.apiNamespace}`,
	conversionEndpoint: '',
	orgId: '',
	title: '',
	version: '',
	revision: '1000',
	message: '',
	edition: 'Community',
	valid: true,
	allowAnonymousAccess: false,
	authProvider: null,
	authConfig: null,
	configured: true,
	setupMode: false,
	secureMode: false,
	maxTags: 3,
	storageProvider: '',
	location: 'selfhost',
	// for bugfix releases, only admin is made aware of new release and end users see no What's New messaging
	updateAvailable: false,
	// empty theme uses default theme
	theme: '',
	locale: '',
	locales: null,

	getBaseUrl(endpoint) {
		return [this.get('endpoint'), endpoint].join('/');
	},

	boot(requestedRoute, requestedUrl) { // eslint-disable-line no-unused-vars
		let constants = this.get('constants');
		this.set('authProvider', constants.AuthProvider.Documize);

		let dbhash;
		if (!_.isNull(document.head.querySelector("[property=dbhash]"))) {
			dbhash = document.head.querySelector("[property=dbhash]").content;
		}

		let isInSetupMode = dbhash && dbhash !== "{{.DBhash}}";
		if (isInSetupMode) {
			let edition = document.head.querySelector("[property=edition]");
			this.setProperties({
				title: htmlSafe("Documize Community Setup"),
				allowAnonymousAccess: true,
				setupMode: true,
				edition: !_.isNull(edition) ? edition : 'Community'
			});

			this.get('localStorage').clearAll();

			return resolve(this);
		}

		requestedRoute = requestedRoute.toLowerCase().trim();

		return this.get('ajax').request('public/meta').then((response) => {
			this.setProperties(response);
			this.set('version', 'v' + this.get('version'));
			this.set('appHost', window.location.host);

			// Handle theming
			this.setTheme(this.get('theme'));

			if (requestedRoute === 'secure') {
				this.setProperties({
					title: htmlSafe("Secure document viewing"),
					allowAnonymousAccess: true,
					secureMode: true
				});

				this.get('localStorage').clearAll();
				return resolve(this);
			} else if (!_.includes(requestedUrl, '/auth/') && !_.isEmpty(requestedUrl)) {
				this.get('localStorage').storeSessionItem('entryUrl', requestedUrl);
			}

			let self = this;
			let cacheBuster = + new Date();

			$.getJSON(`https://www.documize.com/community/news/meta.json?cb=${cacheBuster}`, function (versions) {
				let cv = 'v' + versions.community.version;
				let ev = 'v' + versions.enterprise.version;
				let re = self.get('edition');
				let rv = self.get('version');

				self.set('communityLatest', cv);
				self.set('enterpriseLatest', ev);
				self.set('updateAvailable', false); // set to true for testing

				let isNewCommunity = miscUtil.isNewVersion(rv, cv, true);
				let isNewEnterprise = miscUtil.isNewVersion(rv, ev, true);

				if (re === 'Community' && isNewCommunity) self.set('updateAvailable', true);
				if (re === 'Community+' && isNewEnterprise) self.set('updateAvailable', true);
			});

			return response;
		});
	},

	setTheme(theme) {
		$('#theme-link').remove();

		theme = theme.toLowerCase().replace(' ', '-').replace('default', '').trim();
		if (theme.length === 0) {
			return;
		}

		let file = window.assetMapping[`theme${theme}`]
		$('head').append(`<link id="theme-link" rel="stylesheet" href="${file}">`);
	},

	getThemes() {
		return this.get('ajax').request(`public/meta/themes`, {
			method: 'GET'
		}).then((response) => {
			return response;
		});
	}
});
