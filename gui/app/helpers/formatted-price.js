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

export function formattedPrice(params) {
	let pence = params[0];

	if(!_.isNumber(pence)) {
		return '$0'
	}

	let p = parseInt(pence);

	if(p === 0) {
		return '$0'
	}

	let a = pence / 100;

	return `$` + a;
}

export default helper(formattedPrice);
