import { test, skip } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';
// import stubSession from '../helpers/stub-session';

moduleForAcceptance('Acceptance | /');

skip('visiting / when not authenticated and with { allowAnonymousAccess: false } takes user to login', function(assert) {
    visit('/');

    andThen(function() {
        assert.equal(currentURL(), '/auth/login');
    });
});

skip('visiting / when not authenticated and with { allowAnonymousAccess: true } takes user to folder view', function(assert) {
    visit('/');

    andThen(function() {
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });
});

skip('visiting / when authenticated and with { allowAnonymousAccess: true } takes user to dashboard', function(assert) {
    userLogin();

    andThen(function() {
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });
});
