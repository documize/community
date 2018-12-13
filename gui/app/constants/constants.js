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
    SpaceType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
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

	// Meta
	StoreProvider: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		MySQL: 'MySQL',
		PostgreSQL: 'PostgreSQL',
	},

	// Product is where we try to balance the fine line between useful open core
	// and the revenue-generating proprietary edition.
	Product: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		// CommunityEdition is AGPL licensed open core of product.
		CommunityEdition: 'Community',

		// EnterpriseEdition is proprietary closed-source product.
		EnterpriseEdition: 'Enterprise',

		// PackageEssentials provides core capabilities.
		PackageEssentials:  "Essentials",

		// PackageAdvanced provides analytics, reporting,
		// content lifecycle, content verisoning, and audit logs.
		PackageAdvanced: "Advanced",

		// PackagePremium provides actions, feedback capture,
		// approvals workflow, secure external sharing.
		PackagePremium: "Premium",

		// PackageDataCenter provides multi-tenanting
		// and a bunch of professional services.
		PackageDataCenter: "Data Center",

		// PlanCloud represents *.documize.com hosting.
		PlanCloud: "Cloud",

		// PlanSelfHost represents privately hosted Documize instance.
		PlanSelfHost: "Self-host",

		// Seats0 is 0 users.
		Seats0: 0,

		// Seats1 is 10 users.
		Seats1: 10,

		// Seats2 is 25 users.
		Seats2: 25,

		//Seats3 is 50 users.
		Seats3: 50,

		// Seats4 is 100 users.
		Seats4: 100,

		//Seats5 is 250 users.
		Seats5: 250,

		// Seats6 is unlimited.
		Seats6: 9999
	},

	Icon: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		All: 'dicon-menu-8',
		Announce: 'dicon-notification',
		ArrowUp: 'dicon-arrow-up-2',
		ArrowDown: 'dicon-arrow-down-2',
		ArrowLeft: 'dicon-arrow-left-2',
		ArrowRight: 'dicon-arrow-right-2',
		Attachment: 'dicon-attachment',
		BarChart: 'dicon-chart-bar-2',
		Bookmark: 'dicon-bookmark',
		ButtonAction: 'button-2',
		Database: 'dicon-database',
		Download: 'dicon-download',
		Delete: 'dicon-bin',
		Edit: 'dicon-pen-2',
		Email: 'dicon-email',
		Export: 'dicon-data-upload',
		Export2: 'dicon-upload',
		Filter: 'dicon-sort-tool',
		Grid1: 'dicon-grid-interface',
		Handshake: 'handshake',
		Index: 'dicon-align-justify',
		Integrations: 'dicon-geometry',
		ListBullet: 'dicon-list-bullet-2',
		Locked: 'dicon-lock',
		Print: 'dicon-print',
		Pulse: 'dicon-pulse',
		Plus: 'dicon-e-add',
		Person: 'dicon-single-01',
		People: 'dicon-multiple-19',
		Remove: 'dicon-i-remove',
		Search: 'dicon-magnifier',
		Send: 'dicon-send',
		Settings: 'dicon-settings-gear',
		Tag: 'dicon-delete-key',
		Unlocked: 'dicon-unlocked',
		World: 'dicon-globe',
	},

	Color: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Red: 'red',
		Green: 'green',
		Yellow: 'yellow',
		Gray: 'gray'
	},

	Label: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Add: 'Add',
		Activate: "Activate",
		Cancel: 'Cancel',
		Close: 'Close',
		Delete: 'Delete',
		Export: 'Export',
		Insert: 'Insert',
		Next: 'Next',
		Reset: 'Reset',
		Restore: 'Restore',
		Save: 'Save',
		SignIn: 'Sign In',
		Update: 'Update',
	}
});

export default { constants }
