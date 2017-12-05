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

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { A } from "@ember/array"
import { schedule } from '@ember/runloop';

export default Component.extend({
    documentService: service('document'),
	categoryService: service('category'),
	sessionService: service('session'),
	maxTags: 3,
	categories: A([]),
	newCategory: '',
	tagz: A([]),
	tagzModal: A([]),
	newTag: '',
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

		$('#document-tags-modal').on('show.bs.modal', (event) => { // eslint-disable-line no-unused-vars
			schedule('afterRender', () => {
				$("#add-tag-field").focus();

				$("#add-tag-field").off("keydown").on("keydown", function(e) {
					if (e.shiftKey) {
						return false;
					}

					if (e.which === 13 || e.which === 45 || e.which === 189 || e.which === 8 || e.which === 127 || (e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 48 && e.which <= 57)) {
						return true;
					}

					return false;
				});

				// make copy of tags for editing
				this.set('tagzEdit', this.get('tagz'));
			});
		});
	},

    willDestroyElement() {
		this._super(...arguments);
		$("#add-tag-field").off("keydown");
    },

	load() {
		this.get('categoryService').getUserVisible(this.get('folder.id')).then((categories) => {
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
		onShowCategoryModal() {
			this.set('showCategoryModal', true);
		},

		onSaveCategory() {
			let docId = this.get('document.id');
			let folderId = this.get('folder.id');
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

			this.set('showCategoryModal', false);

			this.get('categoryService').setCategoryMembership(toUnlink, 'unlink').then(() => {
				this.get('categoryService').setCategoryMembership(toLink, 'link').then(() => {
					this.load();
				});
			});

			return true;
		},

		onAddTag(e) {
			e.preventDefault();

            let tags = this.get("tagzEdit");
            let tag = this.get('newTag');
            tag = tag.toLowerCase().trim();

            // empty or dupe?
            if (tag.length === 0 || _.contains(tags, tag) || tags.length >= this.get('maxTags') || tag.startsWith('-')) {
				$('#add-tag-field').addClass('is-invalid');
                return;
            }

            tags.pushObject(tag);
            this.set('tagzEdit', tags);
            this.set('newTag', '');
			$('#add-tag-field').removeClass('is-invalid');
		},

        onRemoveTag(tagToRemove) {
            this.set('tagzEdit', _.without(this.get("tagzEdit"), tagToRemove));
        },

        onSaveTags() {
            let tags = this.get("tagzEdit");

			let save = "#";
            _.each(tags, function(tag) {
                save = save + tag + "#";
            });

			let doc = this.get('document');
			doc.set('tags', save);
			this.attrs.onSaveDocument(doc);

			this.load();
			this.set('newTag', '');

			$('#document-tags-modal').modal('hide');
			$('#document-tags-modal').modal('dispose');
		},
	}
});
