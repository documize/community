import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import stringUtil from '../utils/string';
import Ember from 'ember';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	author: attr('string'),
	dated: attr(),
	description: attr('string'),
	title: attr('string'),
	type: attr('number', { defaultValue: 0 }),

	slug: Ember.computed('title', function () {
		return stringUtil.makeSlug(this.get('title'));
	}),
	created: attr(),
	revised: attr()
});
