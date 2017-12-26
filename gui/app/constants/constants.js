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

let constants = EmberObject.extend({
    ProtectionType: {
        None: 0,
        Lock: 1,
        Review: 2,

        NoneLabel: 'Changes permitted without approval',
        LockLabel: 'Locked, changes not permitted',
        ReviewLabel: 'Changes require approval before publication',
    },

    ApprovalType: {
        None: 0,
        Anybody: 1,
        Majority: 2,
        Unanimous: 3
    }
});

export default { constants }