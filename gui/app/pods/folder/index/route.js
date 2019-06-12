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
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

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

		let constants = this.get('constants');

		let folders = this.modelFor('folder').folders;
		folders.forEach(f => {
			f.set('selected', false);
		});

		let documents = this.modelFor('folder').documents;
		documents.forEach(d => {
			d.set('selected', false);
		});

		let labelId = this.modelFor('folder').folder.get('labelId');

		return hash({
			folder: this.modelFor('folder').folder,
			permissions: this.modelFor('folder').permissions,
			label: 	_.find(this.modelFor('folder').labels, {id: labelId}),
			labels: this.modelFor('folder').labels,
			labelSpaces: _.filter(folders, function(s) { return s.get('labelId') === labelId; }),
			folders: folders,
			documents: documents,
			documentsDraft: _.filter(documents, function(d) { return d.get('lifecycle') === constants.Lifecycle.Draft; }),
			documentsLive: _.filter(documents, function(d) { return d.get('lifecycle') === constants.Lifecycle.Live; }),
			templates: this.modelFor('folder').templates,
			recentAdd: _.filter(documents, function(d) { return d.get('addRecent'); }),
			recentUpdate: _.filter(documents, function(d) { return d.get('updateRecent'); }),
			showStartDocument: false,
			rootDocCount: 0,
			categories: this.get('categories'),
			categorySummary: this.get('categorySummary'),
			categoryMembers: this.get('categoryMembers'),
		});
	},

	afterModel(model, transition) { // eslint-disable-line no-unused-vars
		let docs = model.documents;
		let categoryMembers = model.categoryMembers;
		let rootDocCount = 0;

		// get documentId's from category members
		let withCat = _.map(categoryMembers, 'documentId');

		// calculate documents without category;
		docs.forEach((d) => {
			if (!withCat.includes(d.get('id'))) rootDocCount+=1;
		});

		model.rootDocCount = rootDocCount;
	}
});
