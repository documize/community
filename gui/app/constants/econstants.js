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

import EmberObject from "@ember/object";

let econstants = EmberObject.extend({
    // Document
    ActionType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Read:               1,
        Feedback:           2,
        Contribute:         3,
        ApprovalRequest:    4,
        Approved:           5,
        Rejected:           6,
    },
});

export default { econstants }