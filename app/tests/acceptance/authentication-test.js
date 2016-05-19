import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | authentication');

test('visiting /auth/login and logging in', function(assert) {
    visit('/auth/login');

    fillIn('#authEmail', 'brizdigital@gmail.com');
    fillIn('#authPassword', 'zinyando123');
    click('button');

    andThen(function() {
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
    });
});

test('logging out a user', function(assert) {
    userLogin();

    visit('/auth/logout'); // logs a user out

    andThen(function() {
        assert.equal(currentURL(), '/');
    });
});
