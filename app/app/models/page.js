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
// import { hasMany } from 'ember-data/relationships';

export default Model.extend({
	documentId: attr('string'),
	orgId: attr('string'),
	contentType: attr('string'),
	pageType: attr('string'),
	level: attr('number', { defaultValue: 1 }),
	sequence: attr('number', { defaultValue: 0 }),
	revisions: attr('number', { defaultValue: 0 }),
	title: attr('string'),
	body: attr('string'),
	rawBody: attr('string'),
	meta: attr(),
	// meta: hasMany('page-meta'),

	tagName: Ember.computed('level', function () {
		return "h" + this.get('level');
	}),

	tocIndent: Ember.computed('level', function () {
		return (this.get('level') - 1) * 20;
	}),

	tocIndentCss: Ember.computed('tocIndent', function () {
		let tocIndent = this.get('tocIndent');
		return `margin-left-${tocIndent}`;
	}),
	created: attr(),
	revised: attr()
});