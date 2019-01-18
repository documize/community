import { module, test } from 'qunit';
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

import { setupTest } from 'ember-qunit';

module('Unit | Service | local storage', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
      let service = this.owner.lookup('service:local-storage');
      assert.ok(service);
  });
});