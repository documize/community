import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('section/gemini/type-renderer', 'Integration | Component | section/gemini/type renderer', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{section/gemini/type-renderer}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#section/gemini/type-renderer}}
      template block text
    {{/section/gemini/type-renderer}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
