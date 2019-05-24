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

import Component from '@ember/component';

export default Component.extend({
	classNames: ['dmz-toolbar'],
	classNameBindings:
		['raised:dmz-toolbar-raised',
		'bordered:dmz-toolbar-bordered',
		'light:dmz-toolbar-light',
		'dark:dmz-toolbar-dark'],
	raised: false,
	bordered: false,
	dark: false,
	light: false,
	tooltip: ''
});
