import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	pageId: attr('string'),
	documentId: attr('string'),
	orgId: attr('string'),
	rawBody: attr('string'),
	config: attr(),
	externalSource: attr('boolean', { defaultValue: false }),
	created: attr(),
	revised: attr(),
});
