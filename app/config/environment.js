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

/* jshint node: true */

module.exports = function (environment) {

	var ENV = {
		modulePrefix: 'documize',
		podModulePrefix: 'documize/pods',
		locationType: 'auto',
		environment: environment,
		rootURL: '/',
		// baseURL: '/',
		apiHost: '',
		apiNamespace: '',
		contentSecurityPolicyHeader: 'Content-Security-Policy-Report-Only',

		EmberENV: {
			FEATURES: {}
		},
		"ember-cli-mirage": {
			enabled: false
		},
		'ember-simple-auth': {
			authenticationRoute: 'auth.login',
			routeAfterAuthentication: 'folders',
			routeIfAlreadyAuthenticated: 'folders'
		},
		APP: {
		}
	};

	if (environment === 'development') {
		ENV.APP.LOG_TRANSITIONS = true;
		ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
		ENV.APP.LOG_RESOLVER = false;
		ENV.APP.LOG_ACTIVE_GENERATION = false;
		ENV.APP.LOG_VIEW_LOOKUPS = false;
		ENV['ember-cli-mirage'] = {
			enabled: false
		};

		ENV.apiHost = "https://localhost:5001";
		ENV.apiNamespace = "api";
	}

	if (environment === 'test') {
		ENV.APP.LOG_RESOLVER = false;
		ENV.APP.LOG_ACTIVE_GENERATION = false;
		ENV.APP.LOG_VIEW_LOOKUPS = false;
		ENV.APP.LOG_TRANSITIONS = true;
		// ENV.APP.LOG_TRANSITIONS_INTERNAL = false;

		ENV.baseURL = '/';
		ENV.locationType = 'none';
		ENV.APP.rootElement = '#ember-testing';
		ENV['ember-cli-mirage'] = {
			enabled: true
		};

		ENV.apiHost = "https://localhost:5001";
	}

	if (environment === 'production') {
		ENV.APP.LOG_RESOLVER = false;
		ENV.APP.LOG_ACTIVE_GENERATION = false;
		ENV.APP.LOG_VIEW_LOOKUPS = false;
		ENV.APP.LOG_TRANSITIONS = false;
		ENV.APP.LOG_TRANSITIONS_INTERNAL = false;

		ENV.apiHost = "";
	}

	process.argv.forEach(function (element) {
		if (element !== undefined) {
			if (element.startsWith("apiHost=")) {
				element = element.replace("apiHost=", "");
				ENV.apiHost = element;
			}
		}
	});

	ENV.apiNamespace = "api";
	ENV.contentSecurityPolicy = null;

	return ENV;
};
