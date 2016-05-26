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
    drop: null,
    target: null,
    button: "Delete",
    color: "flat-red",
    button2: "",
    color2: "2",
    open: "click",
    position: 'bottom right',
    showCancel: true,
    contentId: "",
    focusOn: null, // is there an input field we need to focus?
    selectOn: null, // is there an input field we need to select?
    onOpenCallback: null, // callback when opened
    onAction: null,
    onAction2: null,
    offset: "5px 0",
    targetOffset: "10px 0",
	constrainToWindow: true,
	constrainToScrollParent: true,

    hasSecondButton: Ember.computed('button2', 'color2', function() {
        return is.not.empty(this.get('button2')) && is.not.empty(this.get('color2'));
    }),

    didReceiveAttrs() {
        this.set("contentId", 'dropdown-dialog-' + stringUtil.makeId(10));
    },

    didInsertElement() {
        this._super(...arguments);
        let self = this;

        let drop = new Drop({
            target: document.getElementById(self.get('target')),
            content: self.$(".dropdown-dialog")[0],
            classes: 'drop-theme-basic',
            position: self.get('position'),
            openOn: self.get('open'),
            tetherOptions: {
                offset: self.offset,
                targetOffset: self.targetOffset
            },
            remove: true
        });

        self.set('drop', drop);

        drop.on('open', function() {
            if (is.not.null(self.get("focusOn"))) {
                document.getElementById(self.get("focusOn")).focus();
            }

            if (is.not.null(self.get("selectOn"))) {
                document.getElementById(self.get("selectOn")).select();
            }

            if (is.not.null(self.get("onOpenCallback"))) {
                self.attrs.onOpenCallback(drop);
            }
        });
    },

    willDestroyElement() {
        this.get('drop').destroy();
    },

    actions: {
        onCancel() {
            this.get('drop').close();
        },

        onAction() {
            if (this.get('onAction') === null) {
                return;
            }

            let close = this.attrs.onAction();

            if (close) {
                this.get('drop').close();
            }
        },

        onAction2() {
            if (this.get('onAction2') === null) {
                return;
            }

            let close = this.attrs.onAction2();

            if (close) {
                this.get('drop').close();
            }
        }
    }
});
