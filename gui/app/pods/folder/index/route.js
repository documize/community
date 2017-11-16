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

import { Promise as EmberPromise, hash } from 'rsvp';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	categoryService: service('category'),

	beforeModel() {
		return new EmberPromise((resolve) => {
			this.get('categoryService').fetchSpaceData(this.modelFor('folder').folder.get('id')).then((data) => {
				this.set('categories', data.category);
				this.set('categorySummary', data.summary);
				this.set('categoryMembers', data.membership);

				resolve(data);
			});
		});
	},

	model() {
		this.get('browser').setTitle(this.modelFor('folder').folder.get('name'));

		return hash({
			folder: this.modelFor('folder').folder,
			permissions: this.modelFor('folder').permissions,
			folders: this.modelFor('folder').folders,
			documents: this.modelFor('folder').documents,
			templates: this.modelFor('folder').templates,
			showStartDocument: false,
			rootDocCount: 0,
			categories: this.get('categories'),
			categorySummary: this.get('categorySummary'),
			categoryMembers: this.get('categoryMembers'),
			// categories: this.get('categoryService').getUserVisible(this.modelFor('folder').folder.get('id')),
			// categorySummary: this.get('categoryService').getSummary(this.modelFor('folder').folder.get('id')),
			// categoryMembers: this.get('categoryService').getSpaceCategoryMembership(this.modelFor('folder').folder.get('id')),
		});
	},

	afterModel(model, transition) { // eslint-disable-line no-unused-vars
		// model.folder = this.modelFor('folder').folder;
		// model.permissions = this.modelFor('folder').permissions;
		// model.folders =  this.modelFor('folder').folders;
		// model.documents = this.modelFor('folder').documents;
		// model.templates =  this.modelFor('folder').templates;
		// model.showStartDocument = false;
		// model.rootDocCount =  0;

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
	}
});
