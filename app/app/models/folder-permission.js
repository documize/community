import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	orgId: attr('string'),
	folderId: attr('string'),
	userId: attr('string'),
	fullname: attr('string'),
	canView: attr('boolean', { defaultValue: false }),
	canEdit: attr('boolean', { defaultValue: false })
});
