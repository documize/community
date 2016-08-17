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

const {
	inject: { service }
} = Ember;

export default Ember.Service.extend({
	sessionService: service('session'),
	ajax: service(),
	store: service(),

	// Returns document model for specified document id.
	getDocument(documentId) {
		return this.get('ajax').request(`documents/${documentId}`, {
			method: "GET"
		}).then((response) => {
			let data = this.get('store').normalize('document', response);
			return this.get('store').push({ data: data });
		});
	},

	// Returns all documents for specified folder.
	getAllByFolder(folderId) {
		return this.get('ajax').request(`documents?folder=${folderId}`, {
			method: "GET"
		}).then((response) => {
			let documents = Ember.ArrayProxy.create({
				content: Ember.A([])
			});

			if (isObject(response)) {
				return documents;
			}

			documents = response.map((doc) => {
				let data = this.get('store').normalize('document', doc);
				return this.get('store').push({ data: data });
			});

			return documents;
		});
	},

	// getDocumentsByTag returns all documents for specified tag (not folder!).
	getAllByTag(tag) {
		return this.get('ajax').request(`documents?filter=tag&tag=${tag}`, {
			method: "GET"
		}).then((response) => {
			let documents = Ember.ArrayProxy.create({
				content: Ember.A([])
			});

			documents = response.map((doc) => {
				let data = this.get('store').normalize('document', doc);
				return this.get('store').push({ data: data });
			});

			return documents;
		});
	},

	// saveDocument updates an existing document record.
	save(doc) {
		let id = doc.get('id');

		return this.get('ajax').request(`documents/${id}`, {
			method: 'PUT',
			data: JSON.stringify(doc)
		});
	},

	getBatchedPages: function (documentId, payload) {
		let url = `documents/${documentId}/pages/batch`;

		return this.get('ajax').request(url, {
			method: 'POST',
			data: payload
		}).then((pages) => {
			if (is.not.array(pages)) {
				pages = [];
			}

			return pages;
		});
	},

	changePageSequence: function (documentId, payload) {
		let url = `documents/${documentId}/pages/sequence`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	changePageLevel(documentId, payload) {
		let url = `documents/${documentId}/pages/level`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	deleteDocument: function (documentId) {
		let url = `documents/${documentId}`;

		return this.get('ajax').request(url, {
			method: 'DELETE'
		});
	},

	updatePage: function (documentId, pageId, payload, skipRevision) {
		var revision = skipRevision ? "?r=true" : "?r=false";
		let url = `documents/${documentId}/pages/${pageId}${revision}`;

		return this.get('ajax').request(url, {
			method: 'PUT',
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	// addPage inserts new page to an existing document.
	addPage: function (documentId, payload) {
		let url = `documents/${documentId}/pages`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	// Nukes multiple pages from the document.
	deletePages: function (documentId, pageId, payload) {
		let url = `documents/${documentId}/pages/${pageId}`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	// Nukes a single page from the document.
	deletePage: function (documentId, pageId) {
		let url = `documents/${documentId}/pages/${pageId}`;

		return this.get('ajax').request(url, {
			method: 'DELETE'
		});
	},

	getPageRevisions(documentId, pageId) {
		let url = `documents/${documentId}/pages/${pageId}/revisions`;

		return this.get('ajax').request(url, {
			method: "GET"
		});
	},

	getPageRevisionDiff(documentId, pageId, revisionId) {
		let url = `documents/${documentId}/pages/${pageId}/revisions/${revisionId}`;

		return this.get('ajax').request(url, {
			method: "GET",
			dataType: 'text'
		});
	},

	rollbackPage(documentId, pageId, revisionId) {
		let url = `documents/${documentId}/pages/${pageId}/revisions/${revisionId}`;

		return this.get('ajax').request(url, {
			method: "POST"
		});
	},

	// document meta referes to number of views, edits, approvals, etc.
	getMeta(documentId) {

		return this.get('ajax').request(`documents/${documentId}/meta`, {
			method: "GET"
		});
	},

	// Returns all pages without the content
	getTableOfContents(documentId) {

		return this.get('ajax').request(`documents/${documentId}/pages?content=0`, {
			method: 'GET'
		}).then((response) => {
			let data = [];
			data = response.map((obj) => {
				let data = this.get('store').normalize('page', obj);
				return this.get('store').push({ data: data });
			});

			return data;
		});
	},

	// Returns all document pages with content
	getPages(documentId) {

		return this.get('ajax').request(`documents/${documentId}/pages`, {
			method: 'GET'
		}).then((response) => {
			let pages = [];

			pages = response.map((page) => {
				let data = this.get('store').normalize('page', page);
				return this.get('store').push({ data: data });
			});

			return pages;
		});
	},

	// Returns document page with content
	getPage(documentId, pageId) {

		return this.get('ajax').request(`documents/${documentId}/pages/${pageId}`, {
			method: 'GET'
		}).then((response) => {
			let data = this.get('store').normalize('page', response);
			return this.get('store').push({ data: data });
		});
	},

	// Returns document page meta object
	getPageMeta(documentId, pageId) {

		return this.get('ajax').request(`documents/${documentId}/pages/${pageId}/meta`, {
			method: 'GET'
		}).then((response) => {
			let data = this.get('store').normalize('page-meta', response);
			return this.get('store').push({ data: data });
		});
	},

	// document attachments without the actual content
	getAttachments(documentId) {

		return this.get('ajax').request(`documents/${documentId}/attachments`, {
			method: 'GET'
		}).then((response) => {
			let data = [];

			if (isObject(response)) {
				return data;
			}

			data = response.map((obj) => {
				let data = this.get('store').normalize('attachment', obj);
				return this.get('store').push({ data: data });
			});

			return data;
		});
	},

	// nuke an attachment
	deleteAttachment(documentId, attachmentId) {

		return this.get('ajax').request(`documents/${documentId}/attachments/${attachmentId}`, {
			method: 'DELETE'
		});
	},
});

function isObject(a) {
	return (!!a) && (a.constructor === Object);
}
