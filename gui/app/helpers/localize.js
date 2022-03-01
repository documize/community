// Copyright 2022 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// https://www.documize.com

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default Helper.extend({
    i18n: service(),

    compute([key, ...rest]) {
        return this.i18n.localize(key, ...rest);
    }
});
