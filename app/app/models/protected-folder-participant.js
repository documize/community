import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	userId: attr('string'),
	email: attr('string'),
	firstname: attr('string'),
	lastname: attr('string'),
	name: attr('string'),
	folderId: attr('string'),
	folderType: attr('number', { defaultValue: 0 }),

	fullname: Ember.computed('firstname', 'lastname', function () {
		return `${this.get('firstname')} ${this.get('lastname')}`;
	})
});
