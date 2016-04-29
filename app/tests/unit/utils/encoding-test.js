import encodingUtil from '../../../utils/encoding';
import { module, test } from 'qunit';

module('Unit | Utility | encoding helpers');

test("should correctly Base64 encode", function(assert) {
    let result = encodingUtil.Base64.encode("test");
    assert.equal(result, "dGVzdA==");
});
