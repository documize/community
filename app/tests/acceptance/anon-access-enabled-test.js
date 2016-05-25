import { test, skip } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Anon access enabled');

skip('visiting / when not authenticated and with { allowAnonymousAccess: true } takes user to folder view', function(assert) {
    server.create('app-meta', { allowAnonymousAccess: true });
    visit('/');

    return pauseTest();

    andThen(function() {
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });
});

skip('visiting / when authenticated and with { allowAnonymousAccess: true } takes user to dashboard', function(assert) {
    server.create('app-meta', { allowAnonymousAccess: true });
    userLogin();

    andThen(function() {
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });
});
