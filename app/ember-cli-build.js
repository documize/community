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
			extensions: ['js', 'css'],
			exclude: ['tinymce/**', 'codemirror/**']
		},

		minifyJS: {
			enabled: !isDevelopment,
			options: {
				exclude: ['tinymce/**', 'codemirror/**']
			}
		},

		minifyCSS: {
			enabled: !isDevelopment,
			options: {
				exclude: ['tinymce/**', 'codemirror/**']
			}
		},

		sourcemaps: {
			enabled: isDevelopment,
			extensions: ['js']
		}
	});

	app.import('vendor/dropzone.js');
	app.import('vendor/is.js');
	app.import('vendor/md5.js');
	app.import('vendor/moment.js');
	app.import('vendor/mousetrap.js');
	app.import('vendor/table-editor.min.js');
	app.import('vendor/underscore.js');
	app.import('vendor/bootstrap.css');
	app.import('vendor/tether.js');
	app.import('vendor/drop.js');
	app.import('vendor/tooltip.js');
	app.import('vendor/markdown-it.min.js');
	app.import('vendor/sortable.js');
	app.import('vendor/datetimepicker.min.js');
	app.import('vendor/hoverIntent.js');
	app.import('vendor/waypoints.js');

	return app.toTree();
};
