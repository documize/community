// Copyright 2022 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// https://www.documize.com

import Service, { inject as service } from '@ember/service';
import $ from 'jquery';

export default Service.extend({
    langs: { enUS: [], deDE: [] , zhCN: [], ptBR: [], frFR: [], jaJP: [] },
    locales: [],
    session: service(),

    init() {
        this._super(...arguments);
        $.getJSON("/i18n/en-US.json", (data) => {
            this.langs.enUS = data;
        });
        $.getJSON("/i18n/de-DE.json", (data) => {
            this.langs.deDE = data;
        });
        $.getJSON("/i18n/zh-CN.json", (data) => {
            this.langs.zhCN = data;
        });
        $.getJSON("/i18n/pt-BR.json", (data) => {
            this.langs.ptBR = data;
        });
        $.getJSON("/i18n/fr-FR.json", (data) => {
            this.langs.frFR = data;
        });
        $.getJSON("/i18n/ja-JP.json", (data) => {
            this.langs.jaJP = data;
        });
    },

    localize(key, ...args) {
        let str = "";

        switch(this.session.locale) {
            case "en-US":
                str = this.langs.enUS[key];
                break;
            case "de-DE":
                str = this.langs.deDE[key];
                break;
            case "zh-CN":
                str = this.langs.zhCN[key];
                break;
            case "pt-BR":
                str = this.langs.ptBR[key];
                break;
            case "fr-FR":
                str = this.langs.frFR[key];
                break;
            case "ja-JP":
                str = this.langs.jaJP[key];
                break;
        }

        if (_.isUndefined(str)) {
            // eslint-disable-next-line no-console
            console.log(">>>>>>>>>>>> i18n missed key", key);
            return `!${key}!`;
        }

        if (args) {
            for (let i = 0; i < args.length; i++) {
                str = str.replace(`{${i+1}}`, args[i]);
            }
        }

        return str;
    },
});
