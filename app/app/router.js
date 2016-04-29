import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
    location: config.locationType
});

export default Router.map(function() {
    this.route('folders', {
        path: '/'
    }, function() {
        this.route('folder', {
            path: 's/:folder_id/:folder_slug'
        });
        this.route('settings', {
            path: 's/:folder_id/:folder_slug/settings'
        });
    });

    this.route('document', {
        path: 's/:folder_id/:folder_slug/d/:document_id/:document_slug'
    }, function() {
        this.route('edit', {
            path: 'edit/:page_id'
        });
        this.route('wizard', {
            path: 'add'
        });
    });

    this.route('customize', {
        path: 'settings'
    }, function() {
        this.route('general', {
            path: 'general'
        });
        this.route('users', {
            path: 'users'
        });
        this.route('folders', {
            path: 'folders'
        });
    });

    this.route('setup', {
        path: 'setup'
    });

    this.route('auth', {
        path: 'auth'
    }, function() {
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

    this.route('pods', function() {});
});