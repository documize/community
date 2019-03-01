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
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	contentType: attr('string'),
	pageType: attr('string'),
	title: attr('string'),
	description: attr('string'),
	iconFont: attr('string'),
	iconFile: attr('string'),
	retired: attr('boolean'),

	hasImage: computed('iconFont', 'iconFile', function () {
		return this.get('iconFile').length > 0;
	}),

	created: attr(),
	revised: attr()
});
