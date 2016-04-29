import Ember from 'ember';
import TooltipMixin from '../../../mixins/tooltip';
import { module, test } from 'qunit';

module('Unit | Mixin | tooltip');

// Replace this with your real tests.
test('it works', function(assert) {
  let TooltipObject = Ember.Object.extend(TooltipMixin);
  let subject = TooltipObject.create();
  assert.ok(subject);
});
