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
// let constants = this.get('constants');

let constants = EmberObject.extend({
    FolderType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Public: 1,
        Private: 2,
        Protected: 3
    },

    AuthProvider: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Documize: 'documize',
		Keycloak: 'keycloak',
		LDAP: 'ldap',
		ServerTypeLDAP: 'ldap',
		ServerTypeAD: 'ad',
		EncryptionTypeNone: 'none',
		EncryptionTypeStartTLS: 'starttls'
    },

	DocumentActionType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Read: 1,
		Feedback: 2,
		Contribute: 3,
        Approve: 4,
        Approved: 5,
        Rejected: 6,
        Publish: 7,
	},

    UserActivityType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Created: 1,
        Read: 2,
        Edited: 3,
        Deleted: 4,
        Archived: 5,
        Approved: 6,
        Reverted: 7,
        PublishedTemplate: 8,
        PublishedBlock: 9,
        Feedback: 10,
		Rejected: 11,
		SentSecureLink: 12,
		Draft: 13,
		Versioned: 14,
		Searched: 15,
		Published: 16
    },

	// Document
	ProtectionType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		None: 0,
		Lock: 1,
		Review: 2,

		NoneLabel: 'Changes permitted without approval',
		LockLabel: 'Locked, changes not permitted',
		ReviewLabel: 'Changes require approval before publication'
	},

	// Document
	ApprovalType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		None: 0,
		Anybody: 1,
		Majority: 2,
		Unanimous: 3,

		AnybodyLabel: 'Approval required from any approver',
		MajorityLabel: 'Majority approval required from approvers',
		UnanimousLabel: 'Unanimous approval required from all approvers'
	},

	// Section
	ChangeState: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Published: 0,
		Pending: 1,
		UnderReview: 2,
		Rejected: 3,
		PendingNew: 4,
	},

	// Section
	PageType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Tab: 'tab',
		Section: 'section'
	},

	// Who a permission record relates to
	WhoType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		User: 'user',
		Group: 'role'
	},

	EveryoneUserId: '0',
	EveryoneUserName: "Everyone",

	// Document
	Lifecycle: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Draft: 0,
		Live: 1,
		Archived: 2,

		DraftLabel: 'Draft',
		LiveLabel: 'Live',
		ArchivedLabel: 'Archived',
	},

	// Document Version -- document.groupId links different versions of documents together
	VersionCreateMode: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Unversioned: 1,  	// turn unversioned into versioned document
		Cloned: 2,			// create versioned document by cloning existing versioned document
		Linked: 3			// link existing unversion document into this version group
	},

	// Document
	ActionType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Read:               1,
		Feedback:           2,
		Contribute:         3,
		ApprovalRequest:    4,
		Approved:           5,
		Rejected:           6,
		Publish:			7,
	},
});

export default { constants }
