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
import { computed } from '@ember/object';

export default Model.extend({
	orgId: attr('string'),
	userId: attr('string'),
	spaceId: attr('string'),
	documentId: attr('string'),
	sequence: attr('number', { defaultValue: 99 }),
	pin: attr('string'),
	created: attr(),
	revised: attr(),

	isSpace:  computed('documentId', function() {
		return this.get('documentId') === '';
	}),
	isDocument:  computed('documentId', function() {
		return this.get('documentId') !== '';
	})
});
