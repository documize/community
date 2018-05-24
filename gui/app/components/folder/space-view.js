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

import { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';
import { gt } from '@ember/object/computed';
import { computed } from '@ember/object';
import AuthMixin from '../../mixins/auth';
import Component from '@ember/component';

export default Component.extend(AuthMixin, {
	router: service(),
	documentService: service('document'),
	folderService: service('folder'),
	localStorage: service('localStorage'),
	hasCategories: gt('categories.length', 0),
	categoryLinkName: 'Manage',
	spaceSettings: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	init() {
		this._super(...arguments);
		// this.filteredDocs = [];
		this.setup();
	},

	didReceiveAttrs() {
		this._super(...arguments);
		this.setup();
	},

	setup() {
		let categories = this.get('categories');
		let categorySummary = this.get('categorySummary');
		let selectedCategory = '';

		categories.forEach((cat)=> {
			let summary = _.findWhere(categorySummary, {type: "documents", categoryId: cat.get('id')});
			let docCount =  is.not.undefined(summary) ? summary.count : 0;
			cat.set('docCount', docCount);
			if (docCount > 0 && selectedCategory === '') {
				selectedCategory = cat.get('id');
			}
		});

		this.set('categories', categories);
		this.set('categoryLinkName', categories.length > 0 ? 'Manage' : 'Add');

		schedule('afterRender', () => {
			if (this.get('categoryFilter') !== '') {
				this.send('onDocumentFilter', 'category', this.get('categoryFilter'));
			} else {
				this.send('onDocumentFilter', 'space', this.get('folder.id'));
			// } else if (this.get('rootDocCount') > 0) {
			// 	this.send('onDocumentFilter', 'space', this.get('folder.id'));
			// } else if (selectedCategory !== '') {
			// 	this.send('onDocumentFilter', 'category', selectedCategory);
			}
		});
	},

	actions: {
		onDocumentFilter(filter, id) {
			let docs = this.get('documents');
			let categories = this.get('categories');
			let categoryMembers = this.get('categoryMembers');
			let filtered = [];
			let allowed = [];

			switch (filter) {
				case 'category':
					allowed = _.pluck(_.where(categoryMembers, {'categoryId': id}), 'documentId');
					docs.forEach((d) => {
						if (_.contains(allowed, d.get('id'))) {
							filtered.pushObject(d);
						}
					});

					this.set('categoryFilter', id);
					this.set('spaceSelected', false);
					this.set('uncategorizedSelected', false);
					break;

				case 'uncategorized':
					allowed = _.pluck(categoryMembers, 'documentId');
					docs.forEach((d) => {
						if (!_.contains(allowed, d.get('id'))) {
							filtered.pushObject(d);
						}
					});

					this.set('categoryFilter', '');
					this.set('spaceSelected', false);
					this.set('uncategorizedSelected', true);
					break;

				case 'space':
					allowed = _.pluck(categoryMembers, 'documentId');
					docs.forEach((d) => {
						filtered.pushObject(d);
					});

					this.set('categoryFilter', '');
					this.set('spaceSelected', true);
					this.set('uncategorizedSelected', false);
					break;
			}

			categories.forEach((cat)=> {
				cat.set('selected', cat.get('id') === id);
			});

			this.set('categories', categories);
			this.get('onFiltered')(filtered);
		}
	}
});
