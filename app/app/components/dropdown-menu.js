// Copyright (c) 2015 Documize Inc.
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
            position:  self.get('position'),
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
