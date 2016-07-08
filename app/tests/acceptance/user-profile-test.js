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

import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | user profile');

test('visiting /profile', function (assert) {
	server.createList('folder', 2);
	authenticateUser();
	visit('/profile');

	andThen(function () {
		assert.equal(currentURL(), '/profile');
		assert.equal(find('#firstname').val(), 'Lennex', 'Firstaname input displays correct value');
		assert.equal(find('#lastname').val(), 'Zinyando', 'Lastname input displays correct value');
		assert.equal(find('#email').val(), 'brizdigital@gmail.com', 'Email input displays correct value');
	});
});

test('changing user details and email ', function (assert) {
	server.createList('folder', 2);
	authenticateUser();
	visit('/profile');

	andThen(function () {
		assert.equal(currentURL(), '/profile');
		assert.equal(find('.content .name').text().trim(), 'Lennex Zinyando', 'Profile name displayed');
		assert.equal(find('#firstname').val(), 'Lennex', 'Firstaname input displays correct value');
		assert.equal(find('#lastname').val(), 'Zinyando', 'Lastname input displays correct value');
		assert.equal(find('#email').val(), 'brizdigital@gmail.com', 'Email input displays correct value');
	});

	fillIn('#firstname', 'Test');
	fillIn('#lastname', 'User');
	fillIn('#email', 'test.user@domain.com');
	click('.button-blue');

	andThen(function () {
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
		assert.equal(find('.content .name').text().trim(), 'Test User', 'Profile name displayed');
	});
});