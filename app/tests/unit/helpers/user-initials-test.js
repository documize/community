import { userInitials } from '../../../helpers/user-initials';
import { module, test } from 'qunit';

module('Unit | Helper | user initials');

test('should uppercase initials from firstname lastname', function(assert) {
    let result = userInitials(["Some", "name"]);
    assert.equal(result, "SN");
});
