import { test } from 'qunit';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | nologin');

test('visiting /', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL().substring(0, 3), '/s/'); // NOTE because we do not know the correct uuid/space for the database being tested
  });
});
