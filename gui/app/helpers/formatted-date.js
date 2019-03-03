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

import { helper } from '@ember/component/helper';

export function formattedDate(params) {
	let date = params[0];
    let format = params[1];
    if (_.isUndefined(format)) format = 'Do MMMM YYYY, HH:mm';

	// https://momentjs.com/docs/#/manipulating/local/
	return moment.utc(date).local().format(format);

	// in production with 1.65.4 & 1.67.4...
	// return moment(params[0]).utc().format(format);
}

export default helper(formattedDate);
