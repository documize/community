/* eslint-disable ember/require-super-in-init */

'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
let isDevelopment = EmberApp.env() === 'development';

module.exports = function(defaults) {
	let app = new EmberApp(defaults, {
		'ember-cli-terser': {
			enabled: !isDevelopment,
			exclude: ['tinymce/**', 'codemirror/**', 'prism/**', 'pdfjs/**'],

			hiddenSourceMap: true,

			fingerprint: {
				enabled: true,
				generateAssetMap: true,
				fingerprintAssetMap: true,
				prepend: '/',
				extensions: ['js', 'css'],
				exclude: ['tinymce/**', 'codemirror/**', 'prism/**', 'pdfjs/**']
			},

			minifyJS: {
				enabled: !isDevelopment,
				options: {
					exclude: ['tinymce/**', 'codemirror/**', 'prism/**', 'pdfjs/**']
				}
			},

			minifyCSS: {
				enabled: !isDevelopment,
				options: {
					exclude: ['tinymce/**', 'codemirror/**', 'prism/**', 'pdfjs/**']
				}
			},

			outputPaths: {
				app: {
					css: {
						'app': '/assets/documize.css',
						'themes/conference': '/assets/theme-conference.css',
						'themes/forest': '/assets/theme-forest.css',
						'themes/brave': '/assets/theme-brave.css',
						'themes/harvest': '/assets/theme-harvest.css',
						'themes/sunflower': '/assets/theme-sunflower.css',
						'themes/silver': '/assets/theme-silver.css',
					}
				}
			}
		},
	});

	app.import('vendor/clipboard.js');
	app.import('vendor/datetimepicker.min.js');
	app.import('vendor/documize.js');
	app.import('vendor/dropzone.js');
	app.import('vendor/is.js');
	app.import('vendor/iziToast.js');
	app.import('vendor/keycloak.js');
	app.import('vendor/lodash.js');
	app.import('vendor/markdown-it.min.js');
	app.import('vendor/md5.js');
	app.import('vendor/moment.js');
	app.import('vendor/mousetrap.js');
	app.import('vendor/papaparse.js');
	app.import('vendor/prism.js');
	app.import('vendor/slug.js');
	app.import('vendor/sortable.js');
	app.import('vendor/table-editor.min.js');

	// core lib
	app.import('vendor/codemirror.js');
	// boot-up files
	app.import('vendor/codemirror-boot.js');

	app.import('vendor/bootstrap.bundle.min.js');

	return app.toTree();
};
