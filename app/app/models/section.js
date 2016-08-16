import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	contentType: attr('string'),
	title: attr('string'),
	description: attr('string'),
	iconFont: attr('string'),
	iconFile: attr('string'),

	hasImage: Ember.computed('iconFont', 'iconFile', function () {
		return this.get('iconFile').length > 0;
	}),
	created: attr(),
	revised: attr()
});
