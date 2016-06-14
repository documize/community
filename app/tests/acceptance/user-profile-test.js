import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | user profile');

test('visiting /profile', function(assert) {
    server.createList('folder', 2);
    userLogin();
    visit('/profile');

    andThen(function() {
        assert.equal(currentURL(), '/profile');
        assert.equal(find('#firstname').val(), 'Lennex', 'Firstaname input displays correct value');
        assert.equal(find('#lastname').val(), 'Zinyando', 'Lastname input displays correct value');
        assert.equal(find('#email').val(), 'brizdigital@gmail.com', 'Email input displays correct value');
    });
});

test('changing user details and email ', function(assert) {
    server.createList('folder', 2);
    userLogin();
    visit('/profile');

    andThen(function() {
        assert.equal(currentURL(), '/profile');
        assert.equal(find('.name').text().trim(), 'Lennex Zinyando', 'Profile name displayed');
        assert.equal(find('#firstname').val(), 'Lennex', 'Firstaname input displays correct value');
        assert.equal(find('#lastname').val(), 'Zinyando', 'Lastname input displays correct value');
        assert.equal(find('#email').val(), 'brizdigital@gmail.com', 'Email input displays correct value');
    });

    fillIn('#firstname', 'Test');
    fillIn('#lastname', 'User');
    fillIn('#email', 'test.user@domain.com');
    click('.button-blue');

    andThen(function() {
        assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
        assert.equal(find('.content .name').text().trim(), 'Test User', 'Profile name displayed');
    });
});
