// Copyright (c) 2015 Documize Inc.
import Ember from 'ember';
import NotifierMixin from '../mixins/notifier';

export default Ember.Component.extend(NotifierMixin, {
    drop1: null,

    didInsertElement() {
        this._super(...arguments);
        new Tooltip({target: document.getElementById("sample-1")});
        new Tooltip({target: document.getElementById("sample-2")});
        new Tooltip({target: document.getElementById("sample-3")});
        new Tooltip({target: document.getElementById("sample-4")});

        let drop1 = new Drop({
            target: document.getElementById('sample-dropdown-1'),
            content: document.getElementById('sample-dropdown-content-1'),
            classes: 'drop-theme-basic',
            position: 'bottom middle',
            openOn: 'click'
        });

        this.set('drop1', drop1);
    },

    actions: {
        dropClose() {
            this.get('drop1').close();
        },

        addFolder() {
            console.log("adding folder!");
            return true;
        }
    }
});
