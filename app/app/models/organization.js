import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	title: attr('string'),
	message: attr('string'),
	email: attr('string'),
	allowAnonymousAccess: attr('boolean', { defaultValue: false }),
	created: attr(),
	revised: attr()
});
