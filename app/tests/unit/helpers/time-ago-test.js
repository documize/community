import { timeAgo } from '../../../helpers/time-ago';
import { module, test } from 'qunit';

module('Unit | Helper | time ago');

test('should format date as time ago', function(assert) {
    let result = timeAgo([new Date()]);
    assert.equal(result, "a few seconds ago");
});
