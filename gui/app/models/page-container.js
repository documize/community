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
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	// page: belongsTo('page', { inverse: null }),
	// meta: belongsTo('page-meta', { inverse: null }),
	// pending: hasMany('page-pending', { inverse: null }),
	page: attr(),
	meta: attr(),
	pending: attr(),
	changePending: attr('boolean'),
	changeAwaitingReview: attr('boolean'),
	changeRejected: attr('boolean'),
	userHasChangePending: attr('boolean'),
	userHasChangeAwaitingReview: attr('boolean'),
	userHasChangeRejected: attr('boolean'), 
	userHasNewPagePending: attr('boolean')
});
