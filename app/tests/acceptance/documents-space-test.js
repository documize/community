import { test, skip } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | documents space');

skip('Adding a new folder space', function(assert) {
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project');

    andThen(function() {
        let personalSpaces = find('.section div:contains(PERSONAL)').length
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
        assert.equal(personalSpaces, 1, '1 personal space is listed');
    });

    click('#add-folder-button');
    waitToAppear('#new-folder-name');
    fillIn("#new-folder-name", 'Test Folder');
    click('.actions div:contains(add)');

    andThen(function() {
        assert.equal(currentURL(), '/s/V0Vy5Uw_3QeDAMW9/test-folder');
    });
});

skip('Adding a document to a space', function(assert) {
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project');

    andThen(function() {

        let numberOfDocuments = find('.documents-list li').length
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
        assert.equal(numberOfDocuments, 2, '2 documents listed');
    });

    click('#start-document-button');
    waitToAppear('.drop-content');
    click('.drop-content');
    return pauseTest();

    andThen(function() {
        return pauseTest();
        assert.equal(currentURL(), 's/V0Vy5Uw_3QeDAMW9/test-folder');
    });
});

test('visiting space settings page', function(assert) {
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
    userLogin();
    visit('/s/VzMuyEw_3WqiafcG/my-project/settings');

    fillIn('#folderName', 'Test Space');
    click('.button-blue');

    andThen(function() {
        let spaceName = find('.breadcrumb-menu .selected').text().trim();
        checkForCommonAsserts();
        assert.equal(spaceName, 'Test Space', 'Space name has been changed');
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
        return pauseTest();
    });
});

function checkForCommonAsserts() {
    findWithAssert('.sidebar-menu');
    findWithAssert('.options li:contains(General)');
    findWithAssert('.options li:contains(Share)');
    findWithAssert('.options li:contains(Permissions)');
    findWithAssert('.options li:contains(Delete)');
}
