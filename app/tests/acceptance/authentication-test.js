import { test, skip } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Authentication');

test('visiting /auth/login and logging in', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    visit('/auth/login');

    fillIn('#authEmail', 'brizdigital@gmail.com');
    fillIn('#authPassword', 'zinyando123');
    click('button');

    andThen(function() {
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });
});

skip('logging out a user', function(assert) {
    server.create('meta', { allowAnonymousAccess: false });
    userLogin();

    visit('/auth/logout'); // logs a user out

    andThen(function() {
        assert.equal(currentURL(), '/');
    });
});
