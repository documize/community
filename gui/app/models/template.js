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
import attr from 'ember-data/attr';
import stringUtil from '../utils/string';
import Model from 'ember-data/model';


export default Model.extend({
	name: attr('string'),
	excerpt: attr('string'),
	job: attr('string'),
	location: attr('string'),
	orgId: attr('string'),
	spaceId: attr('string'),
	userId: attr('string'),
	tags: attr('string'),
	template: attr('boolean'),
	protection: attr('number', { defaultValue: 0 }),
	approval: attr('number', { defaultValue: 0 }),
	lifecycle: attr('number', { defaultValue: 1 }),
	versioned: attr('boolean'),
	versionId: attr('string'),
	versionOrder: attr('number', { defaultValue: 0 }),
	groupId: attr('string'),

	// client-side property
	selected: attr('boolean', { defaultValue: false }),
	slug: computed('name', function () {
		return stringUtil.makeSlug(this.get('name'));
	}),
	created: attr(),
	revised: attr(),

	isDraft: computed('lifecycle', function () {
		let constants = this.get('constants');
		return this.get('lifecycle') == constants.Lifecycle.Draft;
	}),

	isLive: computed('lifecycle', function () {
		let constants = this.get('constants');
		return this.get('lifecycle') == constants.Lifecycle.Live;
	}),

	lifecycleLabel: computed('lifecycle', function () {
		let constants = this.get('constants');
		let i18n = this.get('i18n');

		switch (this.get('lifecycle')) {
			case constants.Lifecycle.Draft:
				return i18n.localize('draft');
			case constants.Lifecycle.Live:
				return i18n.localize('live');
			case constants.Lifecycle.Archived:
				return i18n.localize('archived');
		}

		return '';
	}),
});


// export default Model.extend({
// 	author: attr('string'),
// 	dated: attr(),
// 	description: attr('string'),
// 	title: attr('string'),
// 	type: attr('number', { defaultValue: 0 }),

// 	slug: computed('title', function () {
// 		return stringUtil.makeSlug(this.get('title'));
// 	}),
// 	created: attr(),
// 	revised: attr()
// });
