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
import dateUtil from '../utils/date';

export function formattedDate(params) {
    let format = params[1];
    if (is.undefined(format)) format = 'Do MMMM YYYY, HH:mm';

    return moment(params[0]).format(format);
}

export default helper(formattedDate);