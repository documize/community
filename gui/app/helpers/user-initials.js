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

// {{user-initials firstname lastname}}
export function userInitials(params) {
    let firstname = params[0];
    let lastname = params[1];

	if (_.isUndefined(firstname)) {
		firstname = " ";
	}
	if (_.isUndefined(lastname)) {
		lastname = " ";
	}

    return (firstname.substring(0, 1) + lastname.substring(0, 1)).toUpperCase();
}

export default helper(userInitials);
