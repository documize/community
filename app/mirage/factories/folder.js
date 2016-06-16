import Mirage, {faker} from 'ember-cli-mirage';

export default Mirage.Factory.extend({
    "id": faker.list.cycle('VzMuyEw_3WqiafcG', 'VzMygEw_3WrtFzto'),
    "created": "2016-05-11T15:08:24Z",
    "revised": "2016-05-11T15:08:24Z",
    "name": faker.list.cycle('My Project', 'Test'),
    "orgId": "VzMuyEw_3WqiafcD",
    "userId": "VzMuyEw_3WqiafcE",
    "folderType": faker.list.cycle(1, 2)
});
