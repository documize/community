module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true,
    jquery: true,
    qunit: true,
    embertest: true
  },
  rules: {
  },
  globals: {
    "$": true,
    "is": true,
    "_": true,
    "tinymce": true,
    "CodeMirror": true,
    "Drop": true,
    "Mousetrap": true,
    "Sortable": true,
    "moment": true,
    "Dropzone": true,
    "Tooltip": true,
    "server": true,
    "authenticateUser": true,
    "stubAudit": true,
    "stubUserNotification": true,
    "userLogin": true,
    "Keycloak": true,
    "Intercom": true,
    "slug": true
  }
};
