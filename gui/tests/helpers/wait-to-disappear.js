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

import { Promise as EmberPromise } from 'rsvp';

import { registerAsyncHelper } from '@ember/test';
import { later } from '@ember/runloop';

function isVisible(selector) {
	return $(selector).length > 0;
}

function checkVisibility(selector, interval, resolve, visibility) {
	if (isVisible(selector) === visibility) {
		resolve($(selector));
	} else {
		later(null, function () {
			checkVisibility(selector, interval, resolve, visibility);
		}, interval);
	}
}

export default registerAsyncHelper('waitToDisappear', function (app, selector, interval = 200) {
	return new EmberPromise(function (resolve) {
		checkVisibility(selector, interval, resolve, false);
	});
});