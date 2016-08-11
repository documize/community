import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import constants from '../utils/constants';
import stringUtil from '../utils/string';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	name: attr('string'),
	orgId: attr('string'),
	userId: attr('string'),
	folderType: constants.FolderType.Private,

	slug: Ember.computed('name', function () {
		return stringUtil.makeSlug(this.get('name'));
	}),

	markAsRestricted: function () {
		this.set('folderType', constants.FolderType.Protected);
	},

	markAsPrivate: function () {
		this.set('folderType', constants.FolderType.Private);
	},

	markAsPublic: function () {
		this.set('folderType', constants.FolderType.Public);
	},

	// client-side prop that holds who can see this folder
	sharedWith: attr(),
	created: attr(),
	revised: attr()
});
