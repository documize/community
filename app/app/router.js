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
import config from './config/environment';

var Router = Ember.Router.extend({
	location: config.locationType
});

export default Router.map(function () {
	this.route('folders', {
		path: '/'
	});

    this.route('folder', {
		path: 's/:folder_id/:folder_slug'
	});

	this.route('settings', {
		path: 's/:folder_id/:folder_slug/settings'
	});

	this.route('document', {
		path: 's/:folder_id/:folder_slug/d/:document_id/:document_slug'
	}, function () {
		this.route('files', {
			path: 'files'
		});
		this.route('activity', {
			path: 'activity'
		});
		this.route('section', {
			path: 'section/:page_id'
		});
		this.route('edit', {
			path: 'edit/:page_id'
		});
		this.route('wizard', {
			path: 'add'
		});
		this.route('history', {
			path: 'history'
		});
		this.route('block', {
			path: 'block/:block_id'
		});
	});

	this.route('customize', {
		path: 'settings'
	}, function () {
		this.route('general', {
			path: 'general'
		});
		this.route('users', {
			path: 'users'
		});
		this.route('folders', {
			path: 'folders'
		});
		this.route('global', {
			path: 'global'
		});
	});

	this.route('setup', {
		path: 'setup'
	});

	this.route('auth', {
		path: 'auth'
	}, function () {
		this.route('sso', {
			path: 'sso/:token'
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
	});

	this.route('profile', {
		path: 'profile'
	});
	this.route('search', {
		path: 'search'
	});
	this.route('accounts', {
		path: 'accounts'
	});

	this.route('widgets', {
		path: 'widgets'
	});

	this.route('not-found', {
		path: '/*wildcard'
	});

	// this.route('pods', function () {});
});
