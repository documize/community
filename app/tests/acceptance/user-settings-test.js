import { test, skip } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | User Settings');

test('visiting /settings/general', function(assert) {
    userLogin();
    visit('/settings/general');

    andThen(function() {
        assert.equal(currentURL(), '/settings/general');
        assert.equal(find('#siteTitle').val(), 'EmberSherpa', 'Website title input is filled in correctly');
        assert.equal(find('textarea').val(), 'This Documize instance contains all our team documentation', 'Message is set correctly');
        assert.equal(find('#allowAnonymousAccess').is(':checked'), false, 'Allow anonymouus checkbox is unchecked');
    });
});

test('changing the Website title and descripttion', function(assert) {
    userLogin();
    visit('/settings/general');

    andThen(function() {
        let websiteTitle = find('.content .title').text().trim();
        let websiteTitleInput = find('#siteTitle').val();
        assert.equal(websiteTitleInput, websiteTitle, 'Website title is set to EmberSherpa');
    });

    fillIn('#siteTitle', 'Documize Tests');
    click('.button-blue');

    andThen(function() {
        let websiteTitle = find('.content .title').text().trim();
        let websiteTitleInput = find('#siteTitle').val();
        assert.equal(websiteTitleInput, websiteTitle, 'Website title is set to Documize Tests');
    });
});

test('visiting /settings/folders', function(assert) {
    userLogin();
    visit('/settings/folders');

    andThen(function() {
        checkForCommonAsserts();
        assert.equal(currentURL(), '/settings/folders');
    });
});

test('visiting /settings/users', function(assert) {
    userLogin();
    visit('/settings/users');

    andThen(function() {
        checkForCommonAsserts();
        findWithAssert('.user-list');
        let numberOfUsers = find('.user-list tr').length;
        assert.equal(numberOfUsers, 3, '2 Users listed');
        assert.equal(currentURL(), '/settings/users');
    });
});

test('add a new user', function(assert) {
    userLogin();
    visit('/settings/users');

    andThen(function() {
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
    return pauseTest();
    andThen(function() {
        let numberOfUsers = find('.user-list tr').length;
        assert.equal(numberOfUsers, 4, '3 Users listed');
        assert.equal(currentURL(), '/settings/users');
    });

});

function checkForCommonAsserts() {
    findWithAssert('.sidebar-menu');
    findWithAssert('#user-button');
    findWithAssert('#accounts-button');
    findWithAssert('a:contains(Dashboard)');
    findWithAssert('a:contains(Settings)');
}
