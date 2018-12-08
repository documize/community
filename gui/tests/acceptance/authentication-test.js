import { click, fillIn, currentURL, visit } from '@ember/test-helpers';
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

module('Acceptance | Authentication', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /auth/login and logging in', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      await visit('/auth/login');

      await fillIn('#authEmail', 'brizdigital@gmail.com');
      await fillIn('#authPassword', 'zinyando123');
      await click('button');

      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project', 'Login successful');
  });

  test('logging out a user', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      userLogin();
      await click('.dropdown-menu a:contains(Logout)');

      assert.equal(currentURL(), '/auth/login', 'Logging out successful');
  });

  test('successful sso login authenticates redirects to dashboard', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });

      await visit('/auth/sso/OmJyaXpkaWdpdGFsQGdtYWlsLmNvbTp6aW55YW5kbzEyMw==');

      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project', 'SSO login successful');
  });

  test('sso login with bad token should redirect to login', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });

      await visit('/auth/sso/randomToken1234567890');

      assert.equal(currentURL(), '/auth/login', 'SSO login unsuccessful');
  });
});
