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

import { htmlSafe } from '@ember/string';

import EmberObject, { computed } from '@ember/object';

import Ember from 'ember';
import stringUtil from '../utils/string';
import constants from '../utils/constants';

let BaseModel = EmberObject.extend({
	id: "",
	created: null,
	revised: null,

	setSafe(attr, value) {
		this.set(attr, htmlSafe(Ember.Handlebars.Utils.escapeExpression(value)));
	}
});

// ProtectedFolderParticipant used to display folder participants that can
// then be marked as folder owner.
let ProtectedFolderParticipant = EmberObject.extend({
	userId: "",
	email: "",
	firstname: "",
	lastname: "",
	name: "",
	folderId: "",
	folderType: 0,

	fullname: computed('firstname', 'lastname', function () {
		return `${this.get('firstname')} ${this.get('lastname')}`;
	})
});

let UserModel = BaseModel.extend({
	firstname: "",
	lastname: "",
	email: "",
	initials: "",
	active: false,
	editor: false,
	admin: false,
	accounts: [],

	fullname: computed('firstname', 'lastname', function () {
		return `${this.get('firstname')} ${this.get('lastname')}`;
	}),

	generateInitials() {
		let first = this.get('firstname').trim();
		let last = this.get('lastname').trim();
		this.set('initials', first.substr(0, 1) + last.substr(0, 1));
	},

	copy() {
		let copy = UserModel.create();
		copy.id = this.id;
		copy.created = this.created;
		copy.revised = this.revised;
		copy.firstname = this.firstname;
		copy.lastname = this.lastname;
		copy.email = this.email;
		copy.initials = this.initials;
		copy.active = this.active;
		copy.editor = this.editor;
		copy.admin = this.admin;
		copy.accounts = this.accounts;

		return copy;
	}
});

let OrganizationModel = BaseModel.extend({
	title: "",
	message: "",
	email: "",
	allowAnonymousAccess: false,
});

let DocumentModel = BaseModel.extend({
	name: "",
	excerpt: "",
	job: "",
	location: "",
	orgId: "",
	folderId: "",
	userId: "",
	tags: "",
	template: "",

	slug: computed('name', function () {
		return stringUtil.makeSlug(this.get('name'));
	}),

	// client-side property
	selected: false
});

let TemplateModel = BaseModel.extend({
	author: "",
	dated: null,
	description: "",
	title: "",
	type: 0,

	slug: computed('title', function () {
		return stringUtil.makeSlug(this.get('title'));
	}),
});

let FolderModel = BaseModel.extend({
	name: "",
	orgId: "",
	userId: "",
	folderType: constants.FolderType.Private,

	slug: computed('name', function () {
		return stringUtil.makeSlug(this.get('name'));
	}),

	markAsRestricted: function () {
		this.set('folderType', constants.FolderType.Protected);
	},

	markAsPrivate: function () {
		this.set('folderType', constants.FolderType.Private);
	},

	markAsPublic: function () {
		this.set('folderType', constants.FolderType.Public);
	},

	// client-side prop that holds who can see this folder
	sharedWith: [],
});

let AttachmentModel = BaseModel.extend({
	documentId: "",
	extension: "",
	fileId: "",
	filename: "",
	job: "",
	orgId: ""
});

let PageModel = BaseModel.extend({
	documentId: "",
	orgId: "",
	contentType: "",
	level: 1,
	sequence: 0,
	revisions: 0,
	title: "",
	body: "",
	rawBody: "",
	meta: {},

	tagName: computed('level', function () {
		return "h" + this.get('level');
	}),

	tocIndent: computed('level', function () {
		return (this.get('level') - 1) * 20;
	}),

	tocIndentCss: computed('tocIndent', function () {
		let tocIndent = this.get('tocIndent');
		return `margin-left-${tocIndent}`;
	}),
});

let PageMetaModel = BaseModel.extend({
	pageId: "",
	documentId: "",
	orgId: "",
	rawBody: "",
	config: {},
	externalSource: false,
});

let SectionModel = BaseModel.extend({
	contentType: "",
	title: "",
	description: "",
	iconFont: "",
	iconFile: "",

	hasImage: computed('iconFont', 'iconFile', function () {
		return this.get('iconFile').length > 0;
	}),
});

export default {
	TemplateModel,
	AttachmentModel,
	DocumentModel,
	FolderModel,
	OrganizationModel,
	PageModel,
	PageMetaModel,
	ProtectedFolderParticipant,
	UserModel,
	SectionModel
};
