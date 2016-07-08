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
import stringUtil from '../utils/string';

export default Ember.Component.extend({
    target: null,
    open: "click",
    position: 'bottom right',
    contentId: "",
    drop: null,

    didReceiveAttrs() {
        this.set("contentId", 'dropdown-menu-' + stringUtil.makeId(10));

        // if (this.session.get('isMobile')) {
        // 	this.set('open', "click");
        // }
    },

    didInsertElement() {
        this._super(...arguments);
        let self = this;

        let drop = new Drop({
            target: document.getElementById(self.get('target')),
            content: self.$(".dropdown-menu")[0],
            classes: 'drop-theme-menu',
            position: self.get('position'),
            openOn: self.get('open'),
            tetherOptions: {
                offset: "5px 0",
                targetOffset: "10px 0"
            }
        });

        self.set('drop', drop);
    },

    willDestroyElement() {
        this.get('drop').destroy();
    }
});