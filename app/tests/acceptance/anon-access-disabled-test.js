import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Anon access disabled');

test('visiting / when not authenticated and with { allowAnonymousAccess: false } takes user to login', function (assert) {
    server.create('meta', { allowAnonymousAccess: false });
    server.createList('folder', 2);
    visit('/');

    andThen(function () {
        assert.equal(currentURL(), '/auth/login');
        findWithAssert('#authEmail');
        findWithAssert('#authPassword');
        findWithAssert('button');
    });
});
