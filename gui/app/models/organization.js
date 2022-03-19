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

export default Model.extend({
	title: attr('string'),
	message: attr('string'),
	email: attr('string'),
	domain: attr('string'),
	conversionEndpoint: attr('string'),
	allowAnonymousAccess: attr('boolean', { defaultValue: false }),
	maxTags: attr('number', {defaultValue: 3}),
	theme: attr('string'),
	locale: attr('string', { defaultValue: "en-US" }),
	created: attr(),
	revised: attr()
});
