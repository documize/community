import { formattedDate } from '../../../helpers/formatted-date';
import { module, test } from 'qunit';

module('Unit | Helper | formatted date');

test('should format date', function(assert) {
    let result = formattedDate([new Date("1995-12-17T20:18:00"), "Do MMMM YYYY, HH:mm"]);
    assert.equal(result, "17th December 1995, 20:18");
});
