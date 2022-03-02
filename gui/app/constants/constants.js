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
	Unsequenced: 99999,

    SpaceType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Public: 1,
        Private: 2,
        Protected: 3
    },

    AuthProvider: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
        Documize: 'documize',
		Keycloak: 'keycloak',
		LDAP: 'ldap',
		CAS: 'cas',
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
	},

	// Document
	ApprovalType: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		None: 0,
		Anybody: 1,
		Majority: 2,
		Unanimous: 3,
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

	// Database type
	StoreProvider: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		MySQL: 'MySQL',
		PostgreSQL: 'PostgreSQL',
		Percona: 'Percona',
		MariaDB: 'MariaDB',
		SQLServer: 'SQLServer',
	},

	// Product is where we try to balance the fine line between useful open core
	// and the revenue-generating proprietary edition.
	Product: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		// CommunityEdition is AGPL licensed open core of product.
		CommunityEdition: 'Community',

		// EnterpriseEdition is proprietary closed-source product.
		EnterpriseEdition: 'Community+',

		// PackageEssentials provides core capabilities.
		PackageEssentials:  "Essentials",

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
		AddUser: 'dicon-add-27',
		All: 'dicon-menu-8',
		Announce: 'dicon-notification',
		Archive: 'dicon-box',
		ArrowUp: 'dicon-arrow-up-2',
		ArrowDown: 'dicon-arrow-down-2',
		ArrowLeft: 'dicon-arrow-left-2',
		ArrowRight: 'dicon-arrow-right-2',
		ArrowSmallUp: 'dicon-small-up',
		ArrowSmallDown: 'dicon-small-down',
		ArrowSmallLeft: 'dicon-small-left',
		ArrowSmallRight: 'dicon-small-right',
		Attachment: 'dicon-attachment',
		BarChart: 'dicon-chart-bar-33',
		Blocks: 'dicon-menu-6',
		BookmarkSolid: 'dicon-bookmark',
		BookmarkAdd: 'dicon-bookmark-add',
		BookmarkDelete: 'dicon-bookmark-delete',
		ButtonAction: 'dicon-button-2',
		Category: 'dicon-flag',
		Chat: 'dicon-b-chat',
		Checkbox: 'dicon-shape-rectangle',
		CheckboxChecked: 'dicon-i-check',
		Copy: 'dicon-copy',
		Cross: 'dicon-i-remove',
		Database: 'dicon-database',
		Download: 'dicon-download',
		Delete: 'dicon-bin',
		Edit: 'dicon-pen-2',
		Email: 'dicon-email',
		Expand: 'dicon-enlarge',
		Export: 'dicon-data-upload',
		Export2: 'dicon-upload',
		Filter: 'dicon-sort-tool',
		Grid: 'dicon-grid-interface',
		GoTop: 'dicon-move-layer-up',
		Handshake: 'dicon-handshake',
		Index: 'dicon-menu-8',
		Integrations: 'dicon-geometry',
		Link: 'dicon-link',
		ListBullet: 'dicon-list-bullet-2',
		Locked: 'dicon-lock',
		MoreHorizontal: 'dicon-menu-5',
		NotAllowed: 'dicon-ban',
		PDF: 'dicon-pdf',
		Print: 'dicon-print',
		Pulse: 'dicon-pulse',
		Plus: 'dicon-e-add',
		Person: 'dicon-single-01',
		People: 'dicon-multiple-19',
		Preview: 'dicon-preview',
		Read: 'dicon-menu-7',
		RemoveUser: 'dicon-delete-28',
		Search: 'dicon-magnifier',
		Send: 'dicon-send',
		Settings: 'dicon-settings-gear',
		Share: 'dicon-network-connection',
		Sort: 'dicon-alpha-order',
		Split: 'dicon-split-37',
		Tag: 'dicon-delete-key',
		Tick: 'dicon-check',
		TickSingle: 'dicon-check-single',
		TickDouble: 'dicon-check-double',
		TimeBack: 'dicon-time',
		TriangleSmallUp: 'dicon-small-triangle-up',
		TriangleSmallDown: 'dicon-small-triangle-down',
		TriangleSmallLeft: 'dicon-small-triangle-left',
		TriangleSmallRight: 'dicon-small-triangle-right',
		Unarchive: 'dicon-download',
		Unlocked: 'dicon-unlocked',
		UserAssign: 'dicon-b-check',
		World: 'dicon-globe',
	},

	IconMeta: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Star: 'dmeta-meta-star',
		Support: 'dmeta-meta-support',
		Message: 'dmeta-meta-message',
		Apps: 'dmeta-meta-apps',
		Box: 'dmeta-meta-box',
		Gift: 'dmeta-meta-gift',
		Design: 'dmeta-meta-design',
		Bulb: 'dmeta-meta-bulb',
		Metrics: 'dmeta-meta-metrics',
		PieChart: 'dmeta-meta-piechart',
		BarChart: 'dmeta-meta-barchart',
		Finance: 'dmeta-meta-finance',
		Lab: 'dmeta-meta-lab',
		Code: 'dmeta-meta-code',
		Help: 'dmeta-meta-help',
		Manuals: 'dmeta-meta-manuals',
		Flow: 'dmeta-meta-flow',
		Out: 'dmeta-meta-out',
		In: 'dmeta-meta-in',
		Partner: 'dmeta-meta-partner',
		Org: 'dmeta-meta-org',
		Home: 'dmeta-meta-home',
		Infinite: 'dmeta-meta-infinite',
		Todo: 'dmeta-meta-todo',
		Procedure: 'dmeta-meta-procedure',
		Outgoing: 'dmeta-meta-outgoing',
		Incoming: 'dmeta-meta-incoming',
		Travel: 'dmeta-meta-travel',
		Winner: 'dmeta-meta-winner',
		Roadmap: 'dmeta-meta-roadmap',
		Money: 'dmeta-meta-money',
		Security: 'dmeta-meta-security',
		Tune: 'dmeta-meta-tune',
		Guide: 'dmeta-meta-guide',
		Smile: 'dmeta-meta-smile',
		Rocket: 'dmeta-meta-rocket',
		Time: 'dmeta-meta-time',
		Cup: 'dmeta-meta-sales',
		Marketing: 'dmeta-meta-marketing',
		Announce: 'dmeta-meta-announce',
		Devops: 'dmeta-meta-devops',
		World: 'dmeta-meta-world',
		Plan: 'dmeta-meta-plan',
		Components: 'dmeta-meta-components',
		People: 'dmeta-meta-people',
		Checklist: 'dmeta-meta-checklist'
	},

	Color: { // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
		Red: 'red',
		Green: 'green',
		Yellow: 'yellow',
		Gray: 'gray'
	},
});

export default { constants };
