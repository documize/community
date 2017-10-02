// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	categoryService: Ember.inject.service('category'),

	model() {
		this.get('browser').setTitle(this.modelFor('folder').folder.get('name'));

		return Ember.RSVP.hash({
			folder: this.modelFor('folder').folder,
			permissions: this.modelFor('folder').permissions,
			folders: this.modelFor('folder').folders,
			documents: this.modelFor('folder').documents,
			templates: this.modelFor('folder').templates,
			showStartDocument: false,
			categories: this.get('categoryService').getUserVisible(this.modelFor('folder').folder.get('id')),
			categorySummary: this.get('categoryService').getSummary(this.modelFor('folder').folder.get('id')),
			categoryMembers: this.get('categoryService').getSpaceCategoryMembership(this.modelFor('folder').folder.get('id')),
			rootDocCount: 0
		});
	},

	afterModel(model, transition) { // eslint-disable-line no-unused-vars
		let docs = model.documents;
		let categoryMembers = model.categoryMembers;
		let rootDocCount = 0;

		// get documentId's from category members
		let withCat = _.pluck(categoryMembers, 'documentId');

		// calculate documents without category;
		docs.forEach((d) => {
			if (!withCat.includes(d.get('id'))) rootDocCount+=1;
		});

		model.rootDocCount = rootDocCount;

		console.log('afterModel');

	}
});
