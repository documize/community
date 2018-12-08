module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'config/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    },

    // test files
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      env: {
        embertest: true
      }
    }
  ],
  globals: {
	  "is": true,
	  "mermaid": true,
	  "_": true,
	  "tinymce": true,
	  "CodeMirror": true,
	  "Mousetrap": true,
	  "Sortable": true,
	  "moment": true,
	  "Dropzone": true,
	  "server": true,
	  "authenticateUser": true,
	  "stubAudit": true,
	  "stubUserNotification": true,
	  "userLogin": true,
	  "Keycloak": true,
	  "slug": true,
	  "iziToast": true
  }
};
