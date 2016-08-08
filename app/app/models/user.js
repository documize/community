import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	firstname: attr('string'),
	lastname: attr('string'),
	email: attr('string'),
	initials: attr('string'),
	active: attr('boolean', { defaultValue: false }),
	editor: attr('boolean', { defaultValue: false }),
	admin: attr('boolean', { defaultValue: false }),
	accounts: attr(),
	created: attr(),
	revised: attr(),

	fullname: Ember.computed('firstname', 'lastname', function () {
		return `${this.get('firstname')} ${this.get('lastname')}`;
	}),

	generateInitials() {
		let first = this.get('firstname').trim();
		let last = this.get('lastname').trim();
		this.set('initials', first.substr(0, 1) + last.substr(0, 1));
	},
	//
	// copy() {
	// 	let copy = UserModel.create();
	// 	copy.id = this.id;
	// 	copy.created = this.created;
	// 	copy.revised = this.revised;
	// 	copy.firstname = this.firstname;
	// 	copy.lastname = this.lastname;
	// 	copy.email = this.email;
	// 	copy.initials = this.initials;
	// 	copy.active = this.active;
	// 	copy.editor = this.editor;
	// 	copy.admin = this.admin;
	// 	copy.accounts = this.accounts;
	//
	// 	return copy;
	// }
});
