module.exports = {
	root: true,
	parserOptions: {
		ecmaVersion: 2017,
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
		"server": true,
		"authenticateUser": true,
		"stubAudit": true,
		"stubUserNotification": true,
		"userLogin": true,
		"Keycloak": true,
		"slug": true
	}
};
