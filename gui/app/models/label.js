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
import { htmlSafe } from '@ember/string';
import attr from 'ember-data/attr';
import Model from 'ember-data/model';

export default Model.extend({
	orgId: attr('string'),
	name: attr('string'),
	color: attr('string'),
	created: attr(),
	revised: attr(),

	// UI only
	count: 0,
	bgColor: computed('color', function() {
		return htmlSafe("background-color: " + this.get('color') + ";");
	}),
	bgfgColor: computed('color', function() {
		return htmlSafe("background-color: " + this.get('color') + "; color: " + this.get('color') + ";");
	})
});
