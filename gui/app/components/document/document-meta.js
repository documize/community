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
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { schedule } from '@ember/runloop';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(ModalMixin, {
    documentService: service('document'),
	categoryService: service('category'),
	sessionService: service('session'),

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
	tagz: A([]),
	tagzModal: A([]),
	newTag: '',

	contributorMsg: '',
	approverMsg: '',
	userChanges: notEmpty('contributorMsg'),
	isApprover: computed('permissions', function() {
		return this.get('permissions.documentApprove');
	}),
	changeControlMsg: computed('document.protection', function() {
		let p = this.get('document.protection');
		let constants = this.get('constants');
		let msg = '';

		switch (p) {
			case constants.ProtectionType.None:
				msg = constants.ProtectionType.NoneLabel;
				break;
			case constants.ProtectionType.Lock:
				msg = constants.ProtectionType.LockLabel;
				break;
			case constants.ProtectionType.Review:
				msg = constants.ProtectionType.ReviewLabel;
				break;
		}

		return msg;
	}),
	approvalMsg: computed('document.{protection,approval}', function() {
		let p = this.get('document.protection');
		let a = this.get('document.approval');
		let constants = this.get('constants');
		let msg = '';

		if (p === constants.ProtectionType.Review) {
			switch (a) {
				case constants.ApprovalType.Anybody:
					msg = constants.ApprovalType.AnybodyLabel;
					break;
				case constants.ApprovalType.Majority:
					msg = constants.ApprovalType.MajorityLabel;
					break;
				case constants.ApprovalType.Unanimous:
					msg = constants.ApprovalType.UnanimousLabel;
					break;
			}
		}

		return msg;
	}),

	didReceiveAttrs() {
		this._super(...arguments);
		this.load();
		this.workflowStatus();
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

	workflowStatus() {
		let pages = this.get('pages');
		let contributorMsg = '';
		let userPendingCount = 0;
		let userReviewCount = 0;
		let userRejectedCount = 0;
		let approverMsg = '';
		let approverPendingCount = 0;
		let approverReviewCount = 0;
		let approverRejectedCount = 0;

		pages.forEach((item) => {
			if (item.get('userHasChangePending')) userPendingCount+=1;
			if (item.get('userHasChangeAwaitingReview')) userReviewCount+=1;
			if (item.get('userHasChangeRejected')) userRejectedCount+=1;
			if (item.get('changePending')) approverPendingCount+=1;
			if (item.get('changeAwaitingReview')) approverReviewCount+=1;
			if (item.get('changeRejected')) approverRejectedCount+=1;
		});

		if (userPendingCount > 0 || userReviewCount > 0 || userRejectedCount > 0) {
			let label = userPendingCount === 1 ? 'change' : 'changes';
			contributorMsg = `${userPendingCount} ${label} progressing, ${userReviewCount} awaiting review, ${userRejectedCount} rejected`;
		}
		this.set('contributorMsg', contributorMsg);

		if (approverPendingCount > 0 || approverReviewCount > 0 || approverRejectedCount > 0) {
			let label = approverPendingCount === 1 ? 'change' : 'changes';
			approverMsg = `${approverPendingCount} ${label} progressing, ${approverReviewCount} awaiting review, ${approverRejectedCount} rejected`;
		}
		this.set('approverMsg', approverMsg);
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

			let cb = this.get('onSaveDocument');
			cb(doc);

			this.load();
			this.set('newTag', '');

			$('#document-tags-modal').modal('hide');
			$('#document-tags-modal').modal('dispose');
		}
	}
});
