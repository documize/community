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

import $ from 'jquery';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { schedule } from '@ember/runloop';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	documentSvc: service('document'),
	categoryService: service('category'),

	categories: A([]),
	newCategory: '',
	showCategoryModal: false,
	hasCategories: computed('categories', function() {
		return this.get('categories').length > 0;
	}),
	canSelectCategory: computed('categories', function() {
		return (this.get('categories').length > 0 && this.get('permissions.documentEdit'));
	}),
	canAddCategory: computed('categories', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	maxTags: 3,
	tag1: '',
	tag2: '',
	tag3: '',

	didReceiveAttrs() {
		this._super(...arguments);
		this.load();
	},

	didInsertElement() {
		this._super(...arguments);

		schedule('afterRender', () => {
			$("#add-tag-field0").focus();

			$(".tag-input").off("keydown").on("keydown", function(e) {
				if (e.shiftKey && e.which === 9) {
					return true;
				}

					if (e.shiftKey) {
					return false;
				}

				if (e.which === 9 || e.which === 13 || e.which === 16 || e.which === 45 || e.which === 189 || e.which === 8 || e.which === 127 || (e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 48 && e.which <= 57)) {
					return true;
				}

				return false;
			});
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		$(".tag-input").off("keydown");
	},

	load() {
		this.get('categoryService').getUserVisible(this.get('space.id')).then((categories) => {
			let cats = A(categories);
			this.set('categories', cats);
			this.get('categoryService').getDocumentCategories(this.get('document.id')).then((selected) => {
				this.set('selectedCategories', selected);
				selected.forEach((s) => {
					let cat = cats.findBy('id', s.id);
					if (is.not.undefined(cat)) {
						cat.set('selected', true);
						this.set('categories', cats);
					}
				});
			});
		});

		if (!_.isUndefined(this.get('document.tags')) && this.get('document.tags').length > 1) {
			let tags = this.get('document.tags').split('#');
			let counter = 1;
            _.each(tags, (tag) => {
				tag = tag.trim();
				if (tag.length > 0) {
					this.set('tag' + counter, tag);
					counter++;
				}
			});
		}
	},

	actions: {
		onSave() {
			this.showWait();

			let docId = this.get('document.id');
			let folderId = this.get('space.id');
			let link = this.get('categories').filterBy('selected', true);
			let unlink = this.get('categories').filterBy('selected', false);
			let toLink = [];
			let toUnlink = [];

			// prepare links associated with document
			link.forEach((l) => {
				let t = {
					folderId: folderId,
					documentId: docId,
					categoryId: l.get('id')
				};

				toLink.push(t);
			});

			// prepare links no longer associated with document
			unlink.forEach((l) => {
				let t = {
					folderId: folderId,
					documentId: docId,
					categoryId: l.get('id')
				};

				toUnlink.pushObject(t);
			});

			this.get('categoryService').setCategoryMembership(toUnlink, 'unlink').then(() => {
				this.get('categoryService').setCategoryMembership(toLink, 'link').then(() => {
					this.showDone();
				});
			});

			let tag1 = this.get("tag1").toLowerCase().trim();
			let tag2 = this.get("tag2").toLowerCase().trim();
			let tag3 = this.get("tag3").toLowerCase().trim();
			let save = "#";

			if (tag1.startsWith('-')) {
				$('#add-tag-field1').addClass('is-invalid');
				return;
			}
			if (tag2.startsWith('-')) {
				$('#add-tag-field2').addClass('is-invalid');
				return;
			}
			if (tag3.startsWith('-')) {
				$('#add-tag-field3').addClass('is-invalid');
				return;
			}

			(tag1.length > 0 ) ? save += (tag1 + "#") : this.set('tag1', '');
			(tag2.length > 0 && tag2 !== tag1) ? save += (tag2 + "#") : this.set('tag2', '');
			(tag3.length > 0 && tag3 !== tag1 && tag3 !== tag2) ? save += (tag3 + "#") : this.set('tag3', '');

			let doc = this.get('document');
			doc.set('tags', save);

			this.get('onSaveDocument')(doc);
		}
	}
});
