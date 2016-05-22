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

import Ember from 'ember';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),

    init() {
        this.setMetaDescription();
    },

    setTitle(title) {
        document.title = title + " | " + this.get('sessionService').appMeta.title;
    },

    setTitleReverse(title) {
        document.title = this.get('sessionService').appMeta.title + " | " + title;
    },

    setTitleAsPhrase(title) {
        document.title = this.get('sessionService').appMeta.title + " " + title;
    },

    setTitleWithoutSuffix(title) {
        document.title = title;
    },

    setMetaDescription(description) {
        $('meta[name=description]').remove();

        if (is.null(description) || is.undefined(description)) {
            description = this.get('sessionService').appMeta.message;
        }

        $('head').append('<meta name="description" content="' + description + '">');
    }
});