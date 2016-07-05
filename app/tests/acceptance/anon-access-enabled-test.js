import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Anon access enabled');

test('visiting / when not authenticated and with { allowAnonymousAccess: true } takes user to folder view', function (assert) {
    server.create('meta', { allowAnonymousAccess: true });
    server.createList('folder', 2);
    visit('/');
    // return pauseTest();

    andThen(function () {
        assert.equal(find('.login').length, 1, 'Login button is displayed');
        assert.equal(find('.documents-list .document').length, 2, '2 document displayed');
        assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test', 'Dashboard and public spaces are displayed without being signed in');
    });
});

test('visiting / when authenticated and with { allowAnonymousAccess: true } takes user to dashboard', function (assert) {
    server.create('meta', { allowAnonymousAccess: true });
    server.createList('folder', 2);
    visit('/');

    andThen(function () {
        assert.equal(find('.login').length, 1, 'Login button is displayed');
        assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test', 'Dashboard displayed without being signed in');
    });

    userLogin();

    andThen(function () {
        assert.equal(find('.login').length, 0, 'Login button is not displayed');
        assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test', 'Dashboard is displayed after user is signed in');
    });
});
