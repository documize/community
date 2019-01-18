import { findAll, currentURL, visit } from '@ember/test-helpers';
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

module('Acceptance | Anon access enabled', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting / when not authenticated and with { allowAnonymousAccess: true } takes user to folder view', async function(assert) {
      server.create('meta', { allowAnonymousAccess: true });
      await visit('/');

      assert.equal(findAll('.login').length, 1, 'Login button is displayed');
      assert.equal(findAll('.documents-list .document').length, 2, '2 document displayed');
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project', 'Dashboard and public spaces are displayed without being signed in');
  });

  test('visiting / when authenticated and with { allowAnonymousAccess: true } takes user to dashboard', async function(assert) {
      server.create('meta', { allowAnonymousAccess: true });
      await visit('/');

      assert.equal(findAll('.login').length, 1, 'Login button is displayed');
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project', 'Dashboard displayed without being signed in');

      userLogin();

      assert.equal(findAll('.login').length, 0, 'Login button is not displayed');
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project', 'Dashboard is displayed after user is signed in');
  });
});
