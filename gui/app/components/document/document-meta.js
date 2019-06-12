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

import { A } from '@ember/array';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Modals from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(Modals, {
	classNames: ['document-meta-wrapper', 'non-printable'],
	appMeta: service(),
	documentService: service('document'),
	sessionService: service('session'),
	categoryService: service('category'),
	router: service(),
	selectedCategories: A([]),
	tagz: A([]),
	userChanges: notEmpty('contributorMsg'),
	unassigned: computed('selectedCategories', 'tagz', function() {
		return this.get('selectedCategories').length === 0 && this.get('tagz').length === 0;
	}),

	didReceiveAttrs() {
		this._super(...arguments);
		this.load();
	},

	load() {
		this.get('categoryService').getDocumentCategories(this.get('document.id')).then((selected) => {
			this.set('selectedCategories', selected);
		});

		let tagz = [];
		if (!_.isUndefined(this.get('document.tags')) && this.get('document.tags').length > 1) {
			let tags = this.get('document.tags').split('#');
            _.each(tags, function(tag) {
				if (tag.length > 0) {
					tagz.pushObject(tag);
				}
			});
		}

		this.set('tagz', A(tagz));
	},

	actions: {
		onEdit() {
			if (!this.get('permissions.documentEdit')) return;

			this.get('router').transitionTo('document.settings');
		},

		onEditCategory() {
			if (!this.get('permissions.documentEdit')) return;

			this.get('router').transitionTo('document.settings', {queryParams: {tab: 'category'}});
		},

		onSelectVersion(version) {
			let space = this.get('space');

			this.get('router').transitionTo('document', space.get('id'), space.get('slug'), version.documentId, this.get('document.slug'));
		}
	}
});
