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
	documentName: attr('string'),
	folderId: attr('string'),
	contributed: attr('string'),
	viewed: attr('string'),
	created: attr('string'),

	hasContributed: computed('contributed', function () {
		return this.get('contributed').length > 0;
	}),
	hasViewed: computed('viewed', function () {
		return this.get('viewed').length > 0;
	}),
	hasCreated: computed('created', function () {
		return this.get('created').length > 0;
	})
});
