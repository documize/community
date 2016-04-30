/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var isDevelopment = EmberApp.env() === 'development';

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
        tests: true,
        storeConfigInMeta: false,

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

    return app.toTree();
};