import dateUtil from '../../../utils/date';
import { module, test } from 'qunit';

module('Unit | Utility | date helpers');

test("should calculate time ago of a few seconds", function(assert) {
    let result = dateUtil.timeAgo(new Date());
    assert.equal(result, "a few seconds ago");
});

test("should calculate time ago of a day", function(assert) {
    var temp = new Date();
    temp.setDate(temp.getDate()-1);
    let result = dateUtil.timeAgo(temp);
    assert.equal(result, "a day ago");
});

test("should calculate time ago of 2 days", function(assert) {
    var temp = new Date();
    temp.setDate(temp.getDate()-2);
    let result = dateUtil.timeAgo(temp);
    assert.equal(result, "2 days ago");
});

test("should handle ISO date", function(assert) {
    let result = dateUtil.toIsoDate(new Date("1995, 12, 17"));
    assert.equal(result, "1995-12-17T00:00:00+00:00");
});

test("should format short date", function(assert) {
    let result = dateUtil.toShortDate(new Date("1995, 12, 17"));
    assert.equal(result, "1995/12/17");
});
