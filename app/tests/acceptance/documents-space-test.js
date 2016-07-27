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

moduleForAcceptance('Acceptance | Documents space');

test('Adding a new folder space', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMuyEw_3WqiafcG/my-project');

	andThen(function () {
		let personalSpaces = find('.folders-list div:contains(PERSONAL) .list a').length;
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
		assert.equal(personalSpaces, 1, '1 personal space is listed');
	});

	click('#add-folder-button');

	fillIn('#new-folder-name', 'Test Folder');

	click('.actions div:contains(Add)');

	andThen(function () {
		let folderCount = find('.folders-list div:contains(PERSONAL) .list a').length;
		assert.equal(folderCount, 2, 'New folder has been added');
		assert.equal(currentURL(), '/s/V0Vy5Uw_3QeDAMW9/test-folder');
	});

});

test('Adding a document to a space', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMuyEw_3WqiafcG/my-project');

	andThen(function () {

		let numberOfDocuments = find('.documents-list li').length;
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
		assert.equal(numberOfDocuments, 2, '2 documents listed');
	});

	click('.actions div:contains(Start) .flat-green');

	andThen(function () {
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/d/V4y7jkw_3QvCDSeS/new-document', 'New document displayed');
	});

	click('a div:contains(My Project) .space-name');

	andThen(function () {
		let numberOfDocuments = find('.documents-list li').length;
		assert.equal(numberOfDocuments, 3, '3 documents listed');
	});
});

test('visiting space settings page', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMuyEw_3WqiafcG/my-project');

	click('#folder-settings-button');

	andThen(function () {
		checkForCommonAsserts();
		assert.equal(find('#folderName').val().trim(), 'My Project', 'Space name displayed in input box');
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
	});
});

test('changing space name', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMuyEw_3WqiafcG/my-project');

	click('#folder-settings-button');

	fillIn('#folderName', 'Test Space');
	click('.button-blue');

	andThen(function () {
		let spaceName = find('.info .title').text().trim();
		checkForCommonAsserts();
		assert.equal(spaceName, 'Test Space', 'Space name has been changed');
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
	});
});

test('sharing a space', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMuyEw_3WqiafcG/my-project');

	click('#folder-settings-button');

	click(('.sidebar-menu .options li:contains(Share)'));
	fillIn('#inviteEmail', 'share-test@gmail.com');
	click('.button-blue');

	andThen(function () {
		checkForCommonAsserts();
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
	});
});

test('changing space permissions', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();

	visit('/s/VzMygEw_3WrtFzto/test');
	andThen(function () {
		let numberOfPublicFolders = find('.sidebar-menu .folders-list .section .list:first a').length;
		assert.equal(numberOfPublicFolders, 1, '1 folder listed as public');
		assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test');
	});

	click('#folder-settings-button');

	click('.sidebar-menu .options li:contains(Permissions)');

	click('tr:contains(Everyone) #canView-');
	click('tr:contains(Everyone) #canEdit-');
	click('.button-blue');

	visit('/s/VzMygEw_3WrtFzto/test');

	andThen(function () {
		let numberOfPublicFolders = find('.folders-list div:contains(EVERYONE) .list a').length;
		assert.equal(numberOfPublicFolders, 2, '2 folder listed as public');
		assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test');
	});
});

test('deleting a space', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMuyEw_3WqiafcG/my-project');

	click('#folder-settings-button');

	click('.sidebar-menu .options li:contains(Delete)');

	andThen(function () {
		checkForCommonAsserts();
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
	});
});

test('deleting a document', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMuyEw_3WqiafcG/my-project');

	andThen(function () {
		let deleteButton = find('#delete-documents-button');
		let numberOfDocuments = find('.documents-list li');
		assert.equal(numberOfDocuments.length, 2, '2 documents are displayed');
		assert.equal(deleteButton.length, 0, 'Delete button not displayed');
	});

	click('.documents-list li:first .checkbox');

	andThen(function () {
		let deleteButton = find('#delete-documents-button');
		assert.equal(deleteButton.length, 1, 'Delete button displayed after selecting document');
	});

	click('.actions div:contains(Delete) .flat-red');

	andThen(function () {
		let numberOfDocuments = find('.documents-list li');
		assert.equal(numberOfDocuments.length, 1, '1 documents is displayed');
	});
});

test('clicking a document title displays the document', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	authenticateUser();
	visit('/s/VzMygEw_3WrtFzto/test');

	click('a .title:contains(README)');

	andThen(function () {
		findWithAssert('#add-section-button');
		findWithAssert('#delete-document-button');
		findWithAssert('#print-document-button');
		findWithAssert('#save-template-button');
		findWithAssert('#attachment-button');
		findWithAssert('#set-meta-button');
		findWithAssert('.name.space-name');
		findWithAssert('.document-sidebar');
		let title = find('.zone-header .title').text().trim();
		assert.equal(title, 'README', 'document displayed correctly');
		assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test/d/VzMvJEw_3WqiafcI/readme');
	});
});

function checkForCommonAsserts() {
	findWithAssert('.sidebar-menu');
	findWithAssert('.options li:contains(General)');
	findWithAssert('.options li:contains(Share)');
	findWithAssert('.options li:contains(Permissions)');
	findWithAssert('.options li:contains(Delete)');
}
