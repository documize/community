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
import stringUtil from '../utils/string';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	author: attr('string'),
	dated: attr(),
	description: attr('string'),
	title: attr('string'),
	type: attr('number', { defaultValue: 0 }),

	slug: computed('title', function () {
		return stringUtil.makeSlug(this.get('title'));
	}),
	created: attr(),
	revised: attr()
});
