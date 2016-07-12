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

moduleForAcceptance('Acceptance | User Settings');

test('visiting /settings/general', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	server.createList('organization', 1);
	authenticateUser();
	visit('/settings/general');

	andThen(function () {
		assert.equal(currentURL(), '/settings/general');
		assert.equal(find('#siteTitle').val(), 'EmberSherpa', 'Website title input is filled in correctly');
		assert.equal(find('textarea').val(), 'This Documize instance contains all our team documentation', 'Message is set correctly');
		assert.equal(find('#allowAnonymousAccess').is(':checked'), false, 'Allow anonymouus checkbox is unchecked');
	});
});

test('changing the Website title and description', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	server.createList('organization', 1);
	authenticateUser();
	visit('/settings/general');

	andThen(function () {
		let websiteTitle = find('.content .title').text().trim();
		let websiteTitleInput = find('#siteTitle').val();
		assert.equal(websiteTitleInput, websiteTitle, 'Website title is set to EmberSherpa');
	});

	fillIn('#siteTitle', 'Documize Tests');
	click('.button-blue');

	andThen(function () {
		let websiteTitle = find('.content .title').text().trim();
		let websiteTitleInput = find('#siteTitle').val();
		assert.equal(websiteTitleInput, websiteTitle, 'Website title is set to Documize Tests');
	});
});

test('visiting /settings/folders', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/settings/folders');

	andThen(function () {
		checkForCommonAsserts();
		assert.equal(currentURL(), '/settings/folders');
	});
});

test('visiting /settings/users', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	server.createList('user', 2);
	authenticateUser();
	visit('/settings/users');

	andThen(function () {
		checkForCommonAsserts();
		findWithAssert('.user-list');
		let numberOfUsers = find('.user-list tr').length;
		assert.equal(numberOfUsers, 3, '2 Users listed');
		assert.equal(currentURL(), '/settings/users');
	});
});

test('add a new user', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	server.createList('user', 2);
	authenticateUser();
	visit('/settings/users');

	andThen(function () {
		checkForCommonAsserts();
		findWithAssert('.user-list');
		let numberOfUsers = find('.user-list tr').length;
		assert.equal(numberOfUsers, 3, '2 Users listed');
		assert.equal(currentURL(), '/settings/users');
	});

	fillIn('#newUserFirstname', 'Test');
	fillIn('#newUserLastname', 'User');
	fillIn('#newUserEmail', 'test.user@domain.com');
	click('.button-blue');

	// waitToAppear('.user-notification:contains(Added)');
	// waitToDisappear('.user-notification:contains(Added)');

	andThen(function () {
		let numberOfUsers = find('.user-list tr').length;
		assert.equal(numberOfUsers, 4, '3 Users listed');
		assert.equal(currentURL(), '/settings/users');
	});

});

function checkForCommonAsserts() {
	findWithAssert('.sidebar-menu');
	findWithAssert('#user-button');
	findWithAssert('#accounts-button');
	findWithAssert('.info .title');
}
