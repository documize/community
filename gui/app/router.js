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
	});

	this.route('analytics', {
	});

	this.route('activity', {
	});

	this.route(
		'folder',
		{
			path: 's/:folder_id/:folder_slug'
		},
		function () {
			this.route('settings', {
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
			});
			this.route('revisions', {
			});
			this.route('activity', {
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
			});
			this.route('labels', {
			});
			this.route('groups', {
			});
			this.route('users', {
			});
			this.route('folders', {
			});
			this.route('smtp', {
			});
			this.route('product', {
			});
			this.route('notice', {
			});
			this.route('auth', {
			});
			this.route('audit', {
			});
			this.route('search', {
			});
			this.route('integrations', {
			});
			this.route('backup', {
			});
			this.route('billing', {
			});
		}
	);

	this.route('setup', {
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
		},
		function () {
			this.route('sso', {
				path: 'sso/:token'
			});
			this.route('keycloak', {
			});
			this.route('login', {
			});
			this.route('forgot', {
			});
			this.route('reset', {
				path: 'reset/:token'
			});
			this.route('logout', {
			});
			this.route('share', {
				path: 'share/:id/:slug/:serial'
			});
			this.route('cas', {
			});
		}
	);

	this.route('profile', {});

	this.route('search', {});

	this.route('accounts', {});

	this.route('theming', {});

	this.route('updates', {});

	this.route('auth/login', {
		path: '/*wildcard'
		// path: '/*wildcard'
	});
});
