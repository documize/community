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

export default Ember.Component.extend({
    page: {},
    tagName: "li",
    classNames: ["item"],

    // indentLevel: Ember.computed('page', function() {
    //     let nodeLevel = this.get('page.level');
    //     let indent = (nodeLevel - 1) * 20;
    //     return indent;
    // }),

    didReceiveAttrs() {
        // this.set('classNames', ["item", "margin-left-" + this.get("page.tocIndent")]);
    },

    actions: {
        onClick(id) {
            this.get('onClick')(id);
        }
    }
});
