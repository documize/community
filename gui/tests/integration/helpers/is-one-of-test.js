import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:action-type', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
      this.set('inputValue', '1234');

      await render(hbs`{{is-one-of 1 1 2 3}}`);

      assert.equal(find('*').textContent.trim(), 'true');
  });
});
