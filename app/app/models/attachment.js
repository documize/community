import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	documentId: attr('string'),
	extension: attr('string'),
	fileId: attr('string'),
	filename: attr('string'),
	job: attr('string'),
	orgId: attr('string'),
	created: attr(),
	revised: attr(),
});
