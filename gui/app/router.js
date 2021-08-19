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

import config from './config/environment';
import EmberRouter from '@ember/routing/router';

var Router = EmberRouter.extend({
	location: config.locationType,
	rootURL: config.rootURL
});

export default Router.map(function () {
	this.route('folders', {
		path: '/'
	});

	this.route('action', {
		path: 'action'
	});

	this.route('analytics', {
		path: 'analytics'
	});

	this.route('activity', {
		path: 'activity'
	});

	this.route(
		'folder',
		{
			path: 's/:folder_id/:folder_slug'
		},
		function () {
			this.route('settings', {
				path: 'settings'
			});
			this.route('block', {
				path: 'block/:block_id'
			});
		}
	);

	this.route(
		'document',
		{
			path: 's/:folder_id/:folder_slug/d/:document_id/:document_slug'
		},
		function () {
			this.route('section', {
				path: 'section/:page_id'
			});
			this.route('settings', {
				path: 'settings'
			});
			this.route('revisions', {
				path: 'revisions'
			});
			this.route('activity', {
				path: 'activity'
			});
		}
	);

	this.route(
		'customize',
		{
			path: 'settings'
		},
		function () {
			this.route('general', {
				path: 'general'
			});
			this.route('labels', {
				path: 'labels'
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
			this.route('product', {
				path: 'product'
			});
			this.route('notice', {
				path: 'notice'
			});
			this.route('auth', {
				path: 'auth'
			});
			this.route('audit', {
				path: 'audit'
			});
			this.route('search', {
				path: 'search'
			});
			this.route('integrations', {
				path: 'integrations'
			});
			this.route('backup', {
				path: 'backup'
			});
			this.route('billing', {
				path: 'billing'
			});
		}
	);

	this.route('setup', {
		path: 'setup'
	});

	this.route('secure', {
		path: 'secure/:token'
	});

	this.route('jumpto', {
		path: 'link/:jump_type/:jump_id'
	});

	this.route(
		'auth',
		{
			path: 'auth'
		},
		function () {
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
			this.route('cas', {
				path: 'cas'
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

	this.route('theming', {
		path: 'theming'
	});

	this.route('updates', {
		path: 'updates'
	});

	this.route('auth/login', {
		path: '/*wildcard'
		// path: '/*wildcard'
	});
});
