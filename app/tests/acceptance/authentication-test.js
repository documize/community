import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Authentication');

test('visiting /auth/login and logging in', function (assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    visit('/auth/login');

    fillIn('#authEmail', 'brizdigital@gmail.com');
    fillIn('#authPassword', 'zinyando123');
    click('button');

    andThen(function () {
        assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test', 'Login successfull');
    });
});

test('logging out a user', function (assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    userLogin();

    visit('/auth/logout');

    andThen(function () {
        assert.equal(currentURL(), '/auth/login', 'Logging out successfull');
    });
});

test('sso login', function (assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    userLogin();

    visit('/auth/sso/OmJyaXpkaWdpdGFsQGdtYWlsLmNvbTp6aW55YW5kbzEyMw==');

    andThen(function () {
        assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test', 'Login successfull');
    });
});
