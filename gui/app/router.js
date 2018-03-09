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

import EmberRouter from '@ember/routing/router';
import config from './config/environment';

var Router = EmberRouter.extend({
	location: config.locationType
});

export default Router.map(function() {
	this.route('folders', {
		path: '/'
	});

	this.route('dashboard', {
		path: 'dashboard'
	});

	this.route(
		'folder',
		{
			path: 's/:folder_id/:folder_slug'
		},
		function() {
			this.route('category', {
				path: 'category'
			});
		}
	);

	this.route(
		'document',
		{
			path: 's/:folder_id/:folder_slug/d/:document_id/:document_slug'
		},
		function() {
			this.route('section', {
				path: 'section/:page_id'
			});
			this.route('block', {
				path: 'block/:block_id'
			});
		}
	);

	this.route(
		'customize',
		{
			path: 'settings'
		},
		function() {
			this.route('general', {
				path: 'general'
			});
			this.route('groups', {
				path: 'groups'
			});
			this.route('users', {
				path: 'users'
			});
			this.route('folders', {
				path: 'folders'
			});
			this.route('smtp', {
				path: 'smtp'
			});
			this.route('license', {
				path: 'license'
			});
			this.route('auth', {
				path: 'auth'
			});
			this.route('audit', {
				path: 'audit'
			});
		}
	);

	this.route('setup', {
		path: 'setup'
	});

	this.route('secure', {
		path: 'secure/:token'
	});

	this.route(
		'auth',
		{
			path: 'auth'
		},
		function() {
			this.route('sso', {
				path: 'sso/:token'
			});
			this.route('keycloak', {
				path: 'keycloak'
			});
			this.route('login', {
				path: 'login'
			});
			this.route('forgot', {
				path: 'forgot'
			});
			this.route('reset', {
				path: 'reset/:token'
			});
			this.route('logout', {
				path: 'logout'
			});
			this.route('share', {
				path: 'share/:id/:slug/:serial'
			});
		}
	);

	this.route('profile', {
		path: 'profile'
	});

	this.route('search', {
		path: 'search'
	});

	this.route('accounts', {
		path: 'accounts'
	});

	this.route('not-found', {
		path: '/*wildcard'
	});
});
