import stringUtil from '../../../utils/string';
import { module, test } from 'qunit';

module('Unit | Utility | string');

test("should find string suffix", function(assert) {
    let result = stringUtil.endsWith("some words", "words");
    assert.ok(result);
});

test("should generate slug", function(assert) {
    let result = stringUtil.makeSlug("something to slug");
    assert.equal(result, "something-to-slug");
});
