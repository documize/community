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
	orgId: attr('string'),
	documentId: attr('string'),
	whoId: attr('string'),
	who: attr('string'),
	name: attr('string'),
	documentEdit: attr('boolean'),
	documentApprove: attr('boolean'),
	documentRoleEdit: attr('boolean'),
	documentRoleApprove: attr('boolean')
});
