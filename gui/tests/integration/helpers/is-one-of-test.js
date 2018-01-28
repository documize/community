import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('is-one-of', 'helper:action-type', {
	integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
	this.set('inputValue', '1234');

	this.render(hbs`{{is-one-of 1 1 2 3}}`);

	assert.equal(this.$().text().trim(), 'true');
});
