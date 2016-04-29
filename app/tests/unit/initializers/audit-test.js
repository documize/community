import Ember from 'ember';
import AuditInitializer from '../../../initializers/audit';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | audit', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  AuditInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
