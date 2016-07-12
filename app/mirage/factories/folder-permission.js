import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
	"folderId": faker.list.cycle("VzMuyEw_3WqiafcG", "VzMygEw_3WrtFzto"),
	"userId": faker.list.cycle("VzMuyEw_3WqiafcE", "VzMuyEw_3WqiafcE"),
	"canView": true,
	"canEdit": true
});
