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
	documentService: service('document'),
	sessionService: service('session'),
	categoryService: service('category'),
	router: service(),
	contributorMsg: '',
	approverMsg: '',
	userChanges: notEmpty('contributorMsg'),
	isApprover: computed('permissions', function() {
		return this.get('permissions.documentApprove');
	}),
	isSpaceAdmin: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
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

		this.workflowStatus();
		this.load();
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
		this.set('selectedVersion', this.get('versions').findBy('documentId', this.get('document.id')));
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
		onSelectVersion(version) {
			let space = this.get('folder');

			this.get('router').transitionTo('document',
				space.get('id'), space.get('slug'),
				version.documentId, this.get('document.slug'));
		},

		onEditLifecycle() {
		},

		onEditProtection() {
		},

		onEditCategory() {
			if (!this.get('permissions.spaceManage')) return;

			this.get('router').transitionTo('document.settings', {queryParams: {tab: 'meta'}});
		}
	}
});
