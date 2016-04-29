import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';
import { module, test } from 'qunit';

module('Unit | Mixin | notifier');

// Replace this with your real tests.
test('it works', function(assert) {
  let NotifierObject = Ember.Object.extend(NotifierMixin);
  let subject = NotifierObject.create();
  assert.ok(subject);
});
