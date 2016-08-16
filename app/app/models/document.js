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

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
import stringUtil from '../utils/string';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	name: attr('string'),
	excerpt: attr('string'),
	job: attr('string'),
	location: attr('string'),
	orgId: attr('string'),
	folderId: attr('string'),
	userId: attr('string'),
	tags: attr('string'),
	template: attr('string'),

	// client-side property
	selected: attr('boolean', { defaultValue: false }),
	slug: Ember.computed('name', function () {
		return stringUtil.makeSlug(this.get('name'));
	})
});
