import Mirage, {faker} from 'ember-cli-mirage';

export default Mirage.Factory.extend({
    "folderId": faker.list.cycle('V0Vy5Uw_3QeDAMW9', 'VzMuyEw_3WqiafcG', 'VzMygEw_3WrtFzto', 'VzMygEw_3WrtFzto'),
    "userId": faker.list.cycle('VzMuyEw_3WqiafcE', 'VzMuyEw_3WqiafcE', 'VzMuyEw_3WqiafcE', ''),
    "canView":true,
    "canEdit": faker.list.cycle(true, true, true, false)
});
