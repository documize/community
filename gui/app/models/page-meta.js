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

import attr from 'ember-data/attr';
import Model from 'ember-data/model';

export default Model.extend({
	pageId: attr('string'),
	documentId: attr('string'),
	orgId: attr('string'),
	userId: attr('string'),
	rawBody: attr(),
	config: attr(),
	externalSource: attr('boolean', { defaultValue: false }),
	created: attr(),
	revised: attr(),
});
