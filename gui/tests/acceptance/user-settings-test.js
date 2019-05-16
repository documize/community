import {
  click,
  fillIn,
  find,
  findAll,
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

module('Acceptance | User Settings', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /settings/general', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/settings/general');

      assert.equal(currentURL(), '/settings/general');
      assert.equal(find('#siteTitle').value, 'EmberSherpa', 'Website title input is filled in correctly');
      assert.equal(find('textarea').value, 'This Documize instance contains all our team documentation', 'Message is set correctly');
      assert.equal(find('#allowAnonymousAccess').is(':checked'), false, 'Allow anonymouus checkbox is unchecked');
  });

  test('changing the Website title and description', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/settings/general');

      let websiteTitle = find('.content .title').textContent.trim();
      let websiteTitleInput = find('#siteTitle').value;
      assert.equal(websiteTitleInput, websiteTitle, 'Website title is set to EmberSherpa');

      await fillIn('#siteTitle', 'Documize Tests');
      await click('.button-blue');

      websiteTitle = find('.content .title').textContent.trim();
      websiteTitleInput = find('#siteTitle').value;
      assert.equal(websiteTitleInput, websiteTitle, 'Website title is set to Documize Tests');
  });

  test('visiting /settings/folders', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/settings/folders');

      checkForCommonAsserts();
      assert.equal(currentURL(), '/settings/folders');
  });

  test('visiting /settings/users', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/settings/users');

      checkForCommonAsserts();
      findWithAssert('.user-list');
      let numberOfUsers = findAll('.user-list tr').length;
      assert.equal(numberOfUsers, 3, '2 Users listed');
      assert.equal(currentURL(), '/settings/users');
  });

  test('add a new user', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/settings/users');

      checkForCommonAsserts();
      findWithAssert('.user-list');
      let numberOfUsers = findAll('.user-list tr').length;
      assert.equal(numberOfUsers, 3, '2 Users listed');
      assert.equal(currentURL(), '/settings/users');

      await fillIn('#newUserFirstname', 'Test');
      await fillIn('#newUserLastname', 'User');
      await fillIn('#newUserEmail', 'test.user@domain.com');
      await click('.button-blue');

      numberOfUsers = findAll('.user-list tr').length;
      assert.equal(numberOfUsers, 4, '3 Users listed');
      assert.equal(currentURL(), '/settings/users');
  });

  function checkForCommonAsserts() {
      findWithAssert('.sidebar-menu');
      findWithAssert('#user-button');
      findWithAssert('#accounts-button');
      findWithAssert('.info .title');
  }
});
