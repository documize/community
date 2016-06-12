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
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(TooltipMixin, {
    documentService: Ember.inject.service('document'),

    document: {},
    folder: {},

    actions: {
        // Page up - above pages shunt down.
        onPageSequenceChange(pendingChanges) {
            this.attrs.changePageSequence(pendingChanges);
        },

        // Move down - pages below shift up.
        onPageLevelChange(pendingChanges) {
            this.attrs.changePageLevel(pendingChanges);
        },

        gotoPage(id) {
            return this.attrs.gotoPage(id);
        }
    }
});
