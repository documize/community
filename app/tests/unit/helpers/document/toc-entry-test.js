import { documentTocEntry } from '../../../../helpers/document/toc-entry';
import { module, test } from 'qunit';

module('Unit | Helper | document/toc entry');

test('toc entry should be not indented and not selected', function(assert) {
    let result = documentTocEntry(['node-123', 'node-321', 1]);
    assert.equal(result.toString(), "<span style='margin-left: 0px;'></span><span class=''><i class='material-icons toc-bullet'>remove</i></span>");
});

test('toc entry should be indented and selected', function(assert) {
    let result = documentTocEntry(['node-123', 'node-123', 2]);
    assert.equal(result.toString(), "<span style='margin-left: 20px;'></span><span class='selected'><i class='material-icons toc-bullet'>remove</i></span>");
});
