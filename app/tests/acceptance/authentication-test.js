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
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project', 'Login successful');
	});
});

test('logging out a user', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	server.createList('folder', 2);
	userLogin();

	visit('/auth/logout');

	andThen(function () {
		assert.equal(currentURL(), '/auth/login', 'Logging out successful');
	});
});

test('successful sso login authenticates redirects to dashboard', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	server.createList('folder', 2);

	visit('/auth/sso/OmJyaXpkaWdpdGFsQGdtYWlsLmNvbTp6aW55YW5kbzEyMw==');
	// return pauseTest();

	andThen(function () {
		assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project', 'SSO login successful');
	});
});

test('sso login with bad token should redirect to login', function (assert) {
	server.create('meta', { allowAnonymousAccess: false });
	server.createList('folder', 2);

	visit('/auth/sso/randomToken1234567890');

	andThen(function () {
		assert.equal(currentURL(), '/auth/login', 'SSO login unsuccessful');
	});
});
