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
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
	documentId: attr('string'),
	orgId: attr('string'),
	contentType: attr('string'),
	pageType: attr('string'),
	level: attr('number', { defaultValue: 1 }),
	sequence: attr('number', { defaultValue: 1024 }),
	numbering: attr('string'),
	revisions: attr('number', { defaultValue: 0 }),
	blockId: attr('string'),
	title: attr('string'),
	body: attr('string'),
	rawBody: attr('string'),
	meta: attr(),
	status: attr('number', { defaultValue: 0 }),
	relativeId: attr('string'),
	userId: attr('string'),

	tagName: computed('level', function () {
		return "h2";
	}),

	tocIndent: computed('level', function () {
		return (this.get('level') - 1) * 10;
	}),

	tocIndentCss: computed('tocIndent', function () {
		let tocIndent = this.get('tocIndent');
		return `margin-left-${tocIndent}`;
	}),

	hasRevisions: computed('revisions', function () {
		return this.get('revisions') > 0;
	}),

	created: attr(),
	revised: attr(),

	// is this a new page that is pending and belongs to the user?
	isNewPageUserPending(userId) {
		return this.get('relativeId') === '' && this.get('userId') === userId && (
			this.get('status') === this.get('constants').ChangeState.PendingNew || this.get('status') === this.get('constants').ChangeState.UnderReview);
	},

	// is this new page ready for review?
	isNewPageReviewReady() {
		return this.get('relativeId') === '' && this.get('status') === this.get('constants').ChangeState.UnderReview;
	}
});
