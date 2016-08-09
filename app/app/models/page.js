import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	documentId: attr('string'),
	orgId: attr('string'),
	contentType: attr('string'),
	level: attr('number', { defaultValue: 1 }),
	sequence: attr('number', { defaultValue: 0 }),
	revisions: attr('number', { defaultValue: 0 }),
	title: attr('string'),
	body: attr('string'),
	rawBody: attr('string'),
	meta: attr(),
	created: attr(),
	revised: attr(),

	tagName: Ember.computed('level', function () {
		return "h" + this.get('level');
	}),

	tocIndent: Ember.computed('level', function () {
		return (this.get('level') - 1) * 20;
	}),

	tocIndentCss: Ember.computed('tocIndent', function () {
		let tocIndent = this.get('tocIndent');
		return `margin-left-${tocIndent}`;
	})
});
