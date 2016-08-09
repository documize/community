import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
import stringUtil from '../utils/string';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	name: attr('string'),
	excerpt: attr('string'),
	job: attr('string'),
	location: attr('string'),
	orgId: attr('string'),
	folderId: attr('string'),
	userId: attr('string'),
	tags: attr('string'),
	template: attr('string'),

	// client-side property
	selected: attr('boolean', { defaultValue: false }),
	slug: Ember.computed('name', function () {
		return stringUtil.makeSlug(this.get('name'));
	})
});
