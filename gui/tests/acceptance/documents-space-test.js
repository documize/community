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

module('Acceptance | Documents space', function(hooks) {
  setupApplicationTest(hooks);

  test('Adding a new folder space', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMuyEw_3WqiafcG/my-project');

      let personalSpaces = findAll('.folders-list div:contains(PERSONAL) .list a').length;
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
      assert.equal(personalSpaces, 1, '1 personal space is listed');

      await click('#add-folder-button');

      await fillIn('#new-folder-name', 'Test Folder');

      await click('.actions div:contains(Add)');

      let folderCount = findAll('.folders-list div:contains(PERSONAL) .list a').length;
      assert.equal(folderCount, 2, 'New folder has been added');
      assert.equal(currentURL(), '/s/V0Vy5Uw_3QeDAMW9/test-folder');
  });

  test('Adding a document to a space', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMuyEw_3WqiafcG/my-project');

      let numberOfDocuments = findAll('.documents-list li').length;
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project');
      assert.equal(numberOfDocuments, 2, '2 documents listed');

      await click('.actions div:contains(Start) .flat-green');

      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/d/V4y7jkw_3QvCDSeS/new-document', 'New document displayed');

      await click('a div:contains(My Project) .space-name');

      numberOfDocuments = findAll('.documents-list li').length;
      assert.equal(numberOfDocuments, 3, '3 documents listed');
  });

  test('visiting space settings page', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMuyEw_3WqiafcG/my-project');

      await click('#folder-settings-button');

      checkForCommonAsserts();
      assert.equal(find('#folderName').value.trim(), 'My Project', 'Space name displayed in input box');
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
  });

  test('changing space name', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMuyEw_3WqiafcG/my-project');

      await click('#folder-settings-button');

      await fillIn('#folderName', 'Test Space');
      await click('.button-blue');

      let spaceName = find('.info .title').textContent.trim();
      checkForCommonAsserts();
      assert.equal(spaceName, 'Test Space', 'Space name has been changed');
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
  });

  test('sharing a space', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMuyEw_3WqiafcG/my-project');

      await click('#folder-settings-button');

      await click('.sidebar-menu .options li:contains(Share)');
      await fillIn('#inviteEmail', 'share-test@gmail.com');
      await click('.button-blue');

      checkForCommonAsserts();
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
  });

  test('changing space permissions', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();

      await visit('/s/VzMygEw_3WrtFzto/test');
      let numberOfPublicFolders = findAll('.sidebar-menu .folders-list .section .list:first a').length;
      assert.equal(numberOfPublicFolders, 1, '1 folder listed as public');
      assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test');

      await click('#folder-settings-button');

      await click('.sidebar-menu .options li:contains(Permissions)');

      await click('tr:contains(Everyone) #canView-');
      await click('tr:contains(Everyone) #canEdit-');
      await click('.button-blue');

      await visit('/s/VzMygEw_3WrtFzto/test');

      numberOfPublicFolders = findAll('.folders-list div:contains(EVERYONE) .list a').length;
      assert.equal(numberOfPublicFolders, 2, '2 folder listed as public');
      assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test');
  });

  test('deleting a space', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMuyEw_3WqiafcG/my-project');

      await click('#folder-settings-button');

      await click('.sidebar-menu .options li:contains(Delete)');

      checkForCommonAsserts();
      assert.equal(currentURL(), '/s/VzMuyEw_3WqiafcG/my-project/settings');
  });

  test('deleting a document', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMuyEw_3WqiafcG/my-project');

      let deleteButton = find('#delete-documents-button');
      let numberOfDocuments = find('.documents-list li');
      assert.equal(numberOfDocuments.length, 2, '2 documents are displayed');
      assert.equal(deleteButton.length, 0, 'Delete button not displayed');

      await click('.documents-list li:first .checkbox');

      deleteButton = find('#delete-documents-button');
      assert.equal(deleteButton.length, 1, 'Delete button displayed after selecting document');

      await click('.actions div:contains(Delete) .flat-red');

      numberOfDocuments = find('.documents-list li');
      assert.equal(numberOfDocuments.length, 1, '1 documents is displayed');
  });

  test('clicking a document title displays the document', async function(assert) {
      server.create('meta', { allowAnonymousAccess: false });
      authenticateUser();
      await visit('/s/VzMygEw_3WrtFzto/test');

      await click('a .title:contains(README)');

      findWithAssert('#add-section-button');
      findWithAssert('#delete-document-button');
      findWithAssert('#print-document-button');
      findWithAssert('#save-template-button');
      findWithAssert('#attachment-button');
      findWithAssert('#set-meta-button');
      findWithAssert('.name.space-name');
      findWithAssert('.document-sidebar');
      let title = find('.zone-header .title').textContent.trim();
      assert.equal(title, 'README', 'document displayed correctly');
      assert.equal(currentURL(), '/s/VzMygEw_3WrtFzto/test/d/VzMvJEw_3WqiafcI/readme');
  });

  function checkForCommonAsserts() {
      findWithAssert('.sidebar-menu');
      findWithAssert('.options li:contains(General)');
      findWithAssert('.options li:contains(Share)');
      findWithAssert('.options li:contains(Permissions)');
      findWithAssert('.options li:contains(Delete)');
  }
});
