import { test, skip } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';
import Ember from 'ember';

moduleForAcceptance('Acceptance | Documents space');

test('Adding a new folder space', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project');

    andThen(function() {
        let personalSpaces = find('.section div:contains(PERSONAL)').length;
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
        assert.equal(personalSpaces, 1, '1 personal space is listed');
    });

    click('#add-folder-button');

    fillIn('#new-folder-name', 'body', 'Test Folder');

    click('.actions div:contains(Add)', 'body');

    andThen(function() {
        assert.equal(currentURL(), '/s/V0Vy5Uw_3QeDAMW9/test-folder');
    });
});

test('Adding a document to a space', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project');

    andThen(function() {

        let numberOfDocuments = find('.documents-list li').length;
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
        assert.equal(numberOfDocuments, 2, '2 documents listed');
    });

    click('#start-document-button');
    click('.actions div:contains(Add)', 'body');

    andThen(function() {
        let numberOfDocuments = find('.documents-list li').length;
        assert.equal(numberOfDocuments, 3, '3 documents listed');
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
        // return pauseTest();
    });
});

test('visiting space settings page', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project');

    click('#folder-settings-button');

    andThen(function() {
        checkForCommonAsserts();
        assert.equal(find('#folderName').val().trim(), 'My Project', 'Space name displayed in input box');
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
    });
});

test('changing space name', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project/settings');

    fillIn('#folderName', 'Test Space');
    click('.button-blue');

    andThen(function() {
        let spaceName = find('.breadcrumb-menu .selected').text().trim();
        checkForCommonAsserts();
        assert.equal(spaceName, 'Test Space', 'Space name has been changed');
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
    });
});

test('sharing a space', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project/settings');

    click(('.sidebar-menu .options li:contains(Share)'));
    fillIn('#inviteEmail', 'share-test@gmail.com');
    click('.button-blue');

    andThen(function() {
        checkForCommonAsserts();
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
    });
});


// Test will pass after moving to factories
test('changing space permissions', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    andThen(function() {
        let numberOfPublicFolders = find('.folders-list div:first .list a').length;
        assert.equal(numberOfPublicFolders, 1, '1 folder listed as public');
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });

    visit('/s/VzMygEw_3WrtFzto/test/settings');
    click(('.sidebar-menu .options li:contains(Permissions)'));

    click('tr:contains(Everyone) #canView-');
    click('tr:contains(Everyone) #canEdit-');
    click('.button-blue');

    visit('/s/VzMuyEw_3WqiafcG/my-project');

    andThen(function() {
        let numberOfPublicFolders = find('.folders-list div:first .list a').length;
        assert.equal(numberOfPublicFolders, 2, '2 folder listed as public');
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });
});

test('deleting a space', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project/settings');

    click('.sidebar-menu .options li:contains(Delete)');

    andThen(function() {
        checkForCommonAsserts();
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
    });
});

test('deleting a document', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    server.createList('permission', 4);
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project');

    andThen(function() {
        let deleteButton = find('#delete-documents-button');
        let numberOfDocuments = find('.documents-list li');
        assert.equal(numberOfDocuments.length, 2, '2 documents are displayed');
        assert.equal(deleteButton.length, 0, 'Delete button not displayed');
    });

    click('.documents-list li:first .checkbox');

    andThen(function() {
        let deleteButton = find('#delete-documents-button');
        assert.equal(deleteButton.length, 1, 'Delete button displayed after selecting document');
    });

    click('#delete-documents-button');

    waitToAppear('.drop-content');
    click('.actions div:contains(Delete)', 'body');

    andThen(function() {
        let numberOfDocuments = find('.documents-list li');
        assert.equal(numberOfDocuments.length, 1, '1 documents is displayed');
    });
});

function checkForCommonAsserts() {
    findWithAssert('.sidebar-menu');
    findWithAssert('.options li:contains(General)');
    findWithAssert('.options li:contains(Share)');
    findWithAssert('.options li:contains(Permissions)');
    findWithAssert('.options li:contains(Delete)');
}
