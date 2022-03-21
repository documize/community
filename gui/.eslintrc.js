module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
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
    "ember/no-classic-classes": "off",
    "ember/require-tagless-components": "off",
    "ember/require-computed-property-dependencies": "off",
    "ember/no-classic-components": "off",
    "ember/no-assignment-of-untracked-properties-used-in-tracking-contexts": "off",
    "ember/no-component-lifecycle-hooks": "off",
    "ember/no-get": "off",
    "ember/no-jquery": "off",
    "ember/no-mixins": "off",
    "ember/no-actions-hash": "off",
    "ember/require-computed-macros": "off",
    "ember/use-ember-data-rfc-395-imports": "off",
    "ember/avoid-leaking-state-in-ember-objects": "off",
    "ember/require-return-from-computed": "off"
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script'
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
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here

        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off'
      })
    }
  ],
  globals: {
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
	  "iziToast": true,
	  "Papa": true,
    "Popper": true,
    "ClipboardJS": true
  }
};
