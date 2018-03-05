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

// access like so:
//      let constants = this.get('constants');

let constants = EmberObject.extend({
    // Document
    ProtectionType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        None:           0,
        Lock:           1,
        Review:         2,

        NoneLabel:      'Changes permitted without approval',
        LockLabel:      'Locked, changes not permitted',
        ReviewLabel:    'Changes require approval before publication'
    },

    // Document
    ApprovalType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        None:           0,
        Anybody:        1,
        Majority:       2,
        Unanimous:      3,

        AnybodyLabel:   'Approval required from any approver',
        MajorityLabel:  'Majority approval required from approvers',
        UnanimousLabel: 'Unanimous approval required from all approvers'
    },

    // Section
    ChangeState: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Published:      0,
        Pending:        1,
        UnderReview:    2,
        Rejected:       3,
        PendingNew:     4,
    },

    // Section
    PageType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Tab:            'tab',
        Section:        'section'
    },

    // Who a permission record relates to
    WhoType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        User:           'user',
        Group:          'role'
    },

    EveryoneUserId: "0",
    EveryoneUserName: "Everyone"
});

export default { constants }