import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | /');

// TODO: when accessing / with /api/public/meta -> { allowAnonymousAccess: false } then take user to login
// TODO: when accessing / with /api/public/meta -> { allowAnonymousAccess: true } then take user to folers.index
// TODO: when accessing / with /api/public/meta -> { allowAnonymousAccess: true } and user is authenticated -> show authenticated user information

test('visiting /', function(assert) {
  visit('/');

  // setup mirage for /api/public/meta -> { allowAnonymousAccess: false}


  andThen(function() {
    assert.equal(currentURL(), '/login');
  });
});
