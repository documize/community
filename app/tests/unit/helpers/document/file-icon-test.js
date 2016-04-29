import { documentFileIcon } from '../../../../helpers/document/file-icon';
import { module, test } from 'qunit';

module('Unit | Helper | document/file icon');

test('should be file icon of ZIP', function(assert) {
    let result = documentFileIcon(["zIp"]);
    assert.equal(result, "zip.png");
});

test('should be file icon of ZIP (tar)', function(assert) {
    let result = documentFileIcon(["TAR"]);
    assert.equal(result, "zip.png");
});
