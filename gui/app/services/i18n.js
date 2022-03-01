// Copyright 2022 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// https://www.documize.com

import Service, { inject as service } from '@ember/service';
import $ from 'jquery';

export default Service.extend({
    langs: { enUS: [] },
    locales: [],
    session: service(),

    init() {
        this._super(...arguments);
        $.getJSON("/i18n/en-US.json", (data) => {
            this.langs.enUS = data;
        });
    },

    localize(key) {
        console.log(this.session.locale);

        switch(this.session.locale) {
            case "fr-FR":
                return "unsupported";
            default:
                return this.langs.enUS[key];
            }
    },
});
