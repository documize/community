import {
  click,
  fillIn,
  find,
  currentURL,
  visit
} from '@ember/test-helpers';
// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | user profile', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /profile', async function(assert) {
      authenticateUser();
      await visit('/profile');

      assert.equal(currentURL(), '/profile');
      assert.equal(find('#firstname').value, 'Lennex', 'Firstaname input displays correct value');
      assert.equal(find('#lastname').value, 'Zinyando', 'Lastname input displays correct value');
      assert.equal(find('#email').value, 'brizdigital@gmail.com', 'Email input displays correct value');
  });

  test('changing user details and email ', async function(assert) {
      authenticateUser();
      await visit('/profile');

      assert.equal(currentURL(), '/profile');
      assert.equal(find('.content .name').textContent.trim(), 'Lennex Zinyando', 'Profile name displayed');
      assert.equal(find('#firstname').value, 'Lennex', 'Firstaname input displays correct value');
      assert.equal(find('#lastname').value, 'Zinyando', 'Lastname input displays correct value');
      assert.equal(find('#email').value, 'brizdigital@gmail.com', 'Email input displays correct value');

      await fillIn('#firstname', 'Test');
      await fillIn('#lastname', 'User');
      await fillIn('#email', 'test.user@domain.com');
      await click('.button-blue');

      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
      assert.equal(find('.content .name').textContent.trim(), 'Test User', 'Profile name displayed');
  });
});
