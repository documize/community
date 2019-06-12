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
	appMeta: service(),
	documentSvc: service('document'),
	categoryService: service('category'),

	tagz: A([]),
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

	didReceiveAttrs() {
		this._super(...arguments);
		this.load();
	},

	didInsertElement() {
		this._super(...arguments);

		schedule('afterRender', () => {
			$("#add-tag-field-1").focus();

			$(".tag-input").off("keydown").on("keydown", function(e) {
				if (e.shiftKey && e.which === 9) {
					return true;
				}

					if (e.shiftKey) {
					return false;
				}

				if (e.which === 9 ||
					e.which === 13 ||
					e.which === 16 ||
					e.which === 37 ||
					e.which === 38 ||
					e.which === 39 ||
					e.which === 40 ||
					e.which === 45 ||
					e.which === 189 ||
					e.which === 8 ||
					e.which === 127 ||
					(e.which >= 65 && e.which <= 90) ||
					(e.which >= 97 && e.which <= 122) ||
					(e.which >= 48 && e.which <= 57)) {
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
					if (!_.isUndefined(cat)) {
						cat.set('selected', true);
						this.set('categories', cats);
					}
				});
			});
		});

		let counter = 1;
		let tagz = A([]);
		let maxTags = this.get('appMeta.maxTags');

		if (!_.isUndefined(this.get('document.tags')) && this.get('document.tags').length > 1) {
			let tags = this.get('document.tags').split('#');

            _.each(tags, (tag) => {
				tag = tag.trim();
				if (tag.length > 0 && counter <= maxTags) {
					tagz.pushObject({number: counter, value: tag});
					counter++;
				}
			});
		}

		for (let index = counter; index <= maxTags; index++) {
			tagz.pushObject({number: index, value: ''});
		}

		this.set('tagz', tagz);
	},

	actions: {
		onSave() {
			let docId = this.get('document.id');
			let folderId = this.get('space.id');
			let link = this.get('categories').filterBy('selected', true);
			let unlink = this.get('categories').filterBy('selected', false);
			let toLink = [];
			let toUnlink = [];

			// prepare links associated with document
			link.forEach((l) => {
				let t = {
					spaceId: folderId,
					documentId: docId,
					categoryId: l.get('id')
				};

				toLink.push(t);
			});

			// prepare links no longer associated with document
			unlink.forEach((l) => {
				let t = {
					spaceId: folderId,
					documentId: docId,
					categoryId: l.get('id')
				};

				toUnlink.pushObject(t);
			});

			this.get('categoryService').setCategoryMembership(toUnlink, 'unlink').then(() => {
				this.get('categoryService').setCategoryMembership(toLink, 'link').then(() => {
				});
			});

			let tagz = this.get('tagz');
			let tagzToSave = [];

			_.each(tagz, (t) => {
				let tag = t.value.toLowerCase().trim();
				if (tag.length> 0) {
					if (!_.includes(tagzToSave, tag) && !_.startsWith(tag, '-')) {
						tagzToSave.push(tag);
						$('#add-tag-field-' + t.number).removeClass('is-invalid');
					} else {
						$('#add-tag-field-' + t.number).addClass('is-invalid');
					}
				}
			});

			let save = "#";
			_.each(tagzToSave, (t) => {
				save += t;
				save += '#';
			});

			let doc = this.get('document');
			doc.set('tags', save);

			this.get('onSaveDocument')(doc);
		}
	}
});
