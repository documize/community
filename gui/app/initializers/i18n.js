// Copyright 2022 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// https://www.documize.com

export function initialize(application) {
    application.inject('route', 'i18n', 'service:i18n');
    application.inject('controller', 'i18n', 'service:i18n');
    application.inject('component', 'i18n', 'service:i18n');
    application.inject('model', 'i18n', 'service:i18n');
}

export default {
    name: 'i18n',
    after: "application",
    initialize: initialize
};
