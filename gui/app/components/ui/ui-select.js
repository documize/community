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

import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    cssClass: "",
    prompt: null,
    optionValuePath: 'id',
    optionLabelPath: 'name',
    action() {}, // action to fire on change
    // action: Ember.K, // action to fire on change

    // shadow the passed-in `selection` to avoid
    // leaking changes to it via a 2-way binding
    _selection: reads('selection'),

    actions: {
        change() {
            const selectEl = this.$('select')[0];
            const selectedIndex = selectEl.selectedIndex;
            const content = this.get('content');

            // decrement index by 1 if we have a prompt
            const hasPrompt = !!this.get('prompt');
            const contentIndex = hasPrompt ? selectedIndex - 1 : selectedIndex;

            const selection = content[contentIndex];

            // set the local, shadowed selection to avoid leaking
            // changes to `selection` out via 2-way binding
            this.set('_selection', selection);

            const changeCallback = this.get('action');
            changeCallback(selection);
        }
    }
});
