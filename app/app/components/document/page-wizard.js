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
    title: "",
    contentType: "",

    didReceiveAttrs() {
        let section = this.get("sections").get('firstObject');
        section.set("selected", true);
    },

    didInsertElement() {
        $("#page-title").removeClass("error").focus();
    },

    actions: {
        setOption(id) {
            let sections = this.get("sections");

            sections.forEach(function(option) {
                Ember.set(option, 'selected', option.id === id);
            });

            this.set("sections", sections);
        },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction() {
            let title = this.get("title");
            let contentType = this.get("sections").findBy("selected", true).contentType;

            if (is.empty(title)) {
                $("#page-title").addClass("error").focus();
                return;
            }

            this.attrs.onAction(title, contentType);
        }
    }
});