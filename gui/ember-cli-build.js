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

/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var isDevelopment = EmberApp.env() === 'development';

module.exports = function (defaults) {
	var app = new EmberApp(defaults, {
		fingerprint: {
			enabled: true,
			generateAssetMap: true,
			fingerprintAssetMap: true,
			prepend: '/',
			extensions: ['js', 'css'],
			exclude: ['tinymce/**', 'codemirror/**', 'flowchart/**']
		},

		minifyJS: {
			enabled: !isDevelopment,
			options: {
				exclude: ['tinymce/**', 'codemirror/**', 'flowchart/**']
			}
		},

		minifyCSS: {
			enabled: !isDevelopment,
			options: {
				exclude: ['tinymce/**', 'codemirror/**', 'flowchart/**']
			}
		},

		sourcemaps: {
			enabled: isDevelopment,
			extensions: ['js']
		},

		outputPaths: {
			app: {
				css: {
					'app': '/assets/documize.css',
					'themes/blue': '/assets/theme-blue.css',
					'themes/teal': '/assets/theme-teal.css',
					'themes/deep-orange': '/assets/theme-deep-orange.css'
				}
			}
		}
	});

	app.import('vendor/datetimepicker.min.js');
	app.import('vendor/documize.js');
	app.import('vendor/dropzone.js');
	app.import('vendor/hoverIntent.min.js');
	app.import('vendor/interact.min.js');
	app.import('vendor/is.js');
	app.import('vendor/iziToast.js');
	app.import('vendor/keycloak.js');
	app.import('vendor/markdown-it.min.js');
	app.import('vendor/md5.js');
	app.import('vendor/moment.js');
	app.import('vendor/mousetrap.js');
	app.import('vendor/overlay-scrollbars.js');
	app.import('vendor/prism.js');
	app.import('vendor/slug.js');
	app.import('vendor/sortable.js');
	app.import('vendor/table-editor.min.js');
	app.import('vendor/underscore.js');
	app.import('vendor/velocity.js');
	app.import('vendor/velocity.ui.js');
	app.import('vendor/waypoints.js');
	app.import('vendor/codemirror.js'); // boot-up files

	app.import('vendor/bootstrap.bundle.min.js');

	return app.toTree();
};
