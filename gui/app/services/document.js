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

import { set } from '@ember/object';
import { A } from '@ember/array';
import stringUtil from '../utils/string';
import ArrayProxy from '@ember/array/proxy';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
	sessionService: service('session'),
	storageSvc: service('localStorage'),
	folderService: service('folder'),
	ajax: service(),
	store: service(),

	//**************************************************
	// Document
	//**************************************************

	// Returns document model for specified document id.
	getDocument(documentId) {
		return this.get('ajax').request(`documents/${documentId}`, {
			method: "GET"
		}).then((response) => {
			let data = this.get('store').normalize('document', response);
			return this.get('store').push(data);
		}).catch((error) => {
			this.get('router').transitionTo('/not-found');
			return error;
		});
	},

	// Returns all documents for specified space.
	getAllBySpace(spaceId) {
		return this.get('ajax').request(`documents?space=${spaceId}`, {
			method: "GET"
		}).then((response) => {
			let documents = ArrayProxy.create({
				content: A([])
			});
			if (!_.isArray(response)) response = [];

			documents = response.map((doc) => {
				let data = this.get('store').normalize('document', doc);
				return this.get('store').push(data);
			});

			return documents;
		}).catch((error) => {
			return error;
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

	deleteDocument(documentId) {
		let url = `documents/${documentId}`;

		return this.get('ajax').request(url, {
			method: 'DELETE'
		});
	},


	// Duplicate creates a copy.
	duplicate(spaceId, docId, docName) {
		// for (let index = 0; index < 10; index++) {
		// 	let data = {
		// 		spaceId: spaceId,
		// 		documentId: docId,
		// 		documentName: docName + " " + index
		// 	};

		// 	this.get('ajax').request(`document/duplicate`, {
		// 		method: 'POST',
		// 		data: JSON.stringify(data)
		// 	});
		// }

		let data = {
			spaceId: spaceId,
			documentId: docId,
			documentName: docName
		};

		return this.get('ajax').request(`document/duplicate`, {
			method: 'POST',
			data: JSON.stringify(data)
		});
	},

	//**************************************************
	// Page
	//**************************************************

	// addPage inserts new page to an existing document.
	addPage(documentId, payload) {
		let url = `documents/${documentId}/pages`;

		return this.get('ajax').post(url, {
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	updatePage(documentId, pageId, payload, skipRevision) {
		var revision = skipRevision ? "?r=true" : "?r=false";
		let url = `documents/${documentId}/pages/${pageId}${revision}`;

		set(payload.meta, 'id', parseInt(payload.meta.id));

		return this.get('ajax').request(url, {
			method: 'PUT',
			data: JSON.stringify(payload),
			contentType: 'json'
		}).then((response) => {
			let data = this.get('store').normalize('page', response);
			return this.get('store').push(data);
		}).catch((error) => {
			return error;
		});
	},

	// Returns all document pages with content
	getPages(documentId) {
		return this.get('ajax').request(`documents/${documentId}/pages`, {
			method: 'GET'
		}).then((response) => {
			if (!_.isArray(response)) response = [];
			let pages = [];

			pages = response.map((page) => {
				let data = this.get('store').normalize('page', page);
				return this.get('store').push(data);
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
			return this.get('store').push(data);
		});
	},

	// Returns document page meta object
	getPageMeta(documentId, pageId) {
		return this.get('ajax').request(`documents/${documentId}/pages/${pageId}/meta`, {
			method: 'GET'
		}).then((response) => {
			let data = this.get('store').normalize('page-meta', response);
			return this.get('store').push(data);
		}).catch(() => {
		});
	},

	// Nukes multiple pages from the document.
	deletePages(documentId, pageId, payload) {
		let url = `documents/${documentId}/pages`;

		return this.get('ajax').request(url, {
			data: JSON.stringify(payload),
			contentType: 'json',
			method: 'DELETE'
		});
	},

	// Nukes a single page from the document.
	deletePage(documentId, pageId) {
		let url = `documents/${documentId}/pages/${pageId}`;

		return this.get('ajax').request(url, {
			method: 'DELETE'
		});
	},

	// Given a page ID, return all children of the starting page.
	getChildren(pages, pageId) {
		let children = [];
		let pageIndex = _.findIndex(pages, function(i) { return i.get('page.id') === pageId; });
		let item = pages[pageIndex];

		for (var i = pageIndex + 1; i < pages.get('length'); i++) {
			if (i === pageIndex + 1 && pages[i].get('page.level') === item.get('page.level')) break;
			if (pages[i].get('page.level') <= item.get('page.level')) break;

			children.push({ pageId: pages[i].get('page.id'), level: pages[i].get('page.level') - 1 });
		}

		return children;
	},

	//**************************************************
	// Page Revisions
	//**************************************************

	getDocumentRevisions(documentId) {
		let url = `documents/${documentId}/revisions`;

		return this.get('ajax').request(url, {
			method: "GET"
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
		}).then((response) => {
			return response;
		}).catch(() => {
			return "";
		});
	},

	rollbackPage(documentId, pageId, revisionId) {
		let url = `documents/${documentId}/pages/${pageId}/revisions/${revisionId}`;

		return this.get('ajax').request(url, {
			method: "POST"
		});
	},

	//**************************************************
	// Table of contents
	//**************************************************

	// Returns all pages without the content
	getTableOfContents(documentId) {
		return this.get('ajax').request(`documents/${documentId}/pages?content=0`, {
			method: 'GET'
		}).then((response) => {
			if (!_.isArray(response)) response = [];

			let data = [];
			data = response.map((obj) => {
				let data = this.get('store').normalize('page', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	changePageSequence(documentId, payload) {
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

	//**************************************************
	// Attachments
	//**************************************************

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
				return this.get('store').push(data);
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

	//**************************************************
	// Page Move Copy
	//**************************************************

	// Return list of documents that can accept a page.
	getPageMoveCopyTargets() {
		return this.get('ajax').request(`sections/targets`, {
			method: 'GET'
		}).then((response) => {
			if (!_.isArray(response)) response = [];
			let data = [];

			data = response.map((obj) => {
				let data = this.get('store').normalize('document', obj);
				return this.get('store').push(data);
			});

			return data;
		});
	},

	// Copy existing page to same or different document.
	copyPage(documentId, pageId, targetDocumentId) {
		return this.get('ajax').request(`documents/${documentId}/pages/${pageId}/copy/${targetDocumentId}`, {
			method: 'POST'
		}).then((response) => {
			let data = this.get('store').normalize('page', response);
			return this.get('store').push(data);
		});
	},

	// Move existing page to different document.
	movePage(documentId, pageId, targetDocumentId) {
		return this.get('ajax').request(`documents/${documentId}/pages/${pageId}/move/${targetDocumentId}`, {
			method: 'POST'
		}).then((response) => {
			let data = this.get('store').normalize('page', response);
			return this.get('store').push(data);
		});
	},

	//**************************************************
	// Voting / Liking
	//**************************************************

	// Vote records content vote from user.
	// Anonymous users can vote to and are assigned temp id that is stored
	// client-side in browser local storage.
	vote(documentId, vote) {
		let userId = '';

		if (this.get('sessionService.authenticated')) {
			userId = this.get('sessionService.user.id');
		} else {
			let id = this.get('storageSvc').getSessionItem('anonId');

			if (!_.isNull(id) && !_.isUndefined(id) && id.length >= 16) {
				userId = id;
			} else {
				userId = stringUtil.anonUserId();
			}

			this.get('storageSvc').storeSessionItem('anonId', userId);
		}

		let payload = {
			userId: userId,
			vote: vote
		};

		return this.get('ajax').post(`public/document/${documentId}/vote`, {
			data: JSON.stringify(payload),
			contentType: 'json'
		});
	},

	//**************************************************
	// Export content to HTML
	//**************************************************

	export(spec) {
		return this.get('ajax').post('export', {
			data: JSON.stringify(spec),
			contentType: 'json',
			dataType: 'html'
		});
	},

	//**************************************************
	// Secure document attachment download
	//**************************************************

	downloadAttachment(fileId) {
		return this.get('ajax').get(`attachment/${fileId}`, {});
	},

	//**************************************************
	// Fetch bulk data
	//**************************************************

	// fetchXXX represents UI specific bulk data loading designed to
	// reduce network traffic and boost app performance.
	// This method returns:
	// 1. getUserVisible()
	// 2. getSummary()
	// 3. getSpaceCategoryMembership()
	fetchDocumentData(documentId) {
		return this.get('ajax').request(`fetch/document/${documentId}`, {
			method: 'GET'
		}).then((response) => {
			let data = {
				document: {},
				permissions: {},
				roles: {},
				folders: [],
				folder: {},
				links: [],
				versions: [],
				attachments: [],
			};

			let doc = this.get('store').normalize('document', response.document);
			doc = this.get('store').push(doc);

			let perms = this.get('store').normalize('space-permission', response.permissions);
			perms = this.get('store').push(perms);
			this.get('folderService').set('permissions', perms);

			let roles = this.get('store').normalize('document-permission', response.roles);
			roles = this.get('store').push(roles);

			let folders = response.folders.map((obj) => {
				let data = this.get('store').normalize('folder', obj);
				return this.get('store').push(data);
			});

			let attachments = response.attachments.map((obj) => {
				let data = this.get('store').normalize('attachment', obj);
				return this.get('store').push(data);
			});

			data.document = doc;
			data.permissions = perms;
			data.roles = roles;
			data.folders = folders;
			data.folder = folders.findBy('id', doc.get('spaceId'));
			data.links = response.links;
			data.versions = response.versions;
			data.attachments = attachments;

			return data;
		}).catch((error) => {
			return error;
		});
	},

	// fetchPages returns all pages, page meta and pending changes for document.
	// This method bulk fetches data to reduce network chatter.
	// We produce a bunch of calculated boolean's for UI display purposes
	// that can tell us quickly about pending changes for UI display.

	// Source - optional identifier of (document) referrer.
	fetchPages(documentId, currentUserId, source) {
		let constants = this.get('constants');
		let changePending = false;
		let changeAwaitingReview = false;
		let changeRejected = false;
		let userHasChangePending = false;
		let userHasChangeAwaitingReview = false;
		let userHasChangeRejected = false;

		if (_.isNull(source) || _.isUndefined(source)) source = "";

		return this.get('ajax').request(`fetch/page/${documentId}?source=${source}`, {
			method: 'GET'
		}).then((response) => {
			let data = A([]);

			response.forEach((page) => {
				changePending = false;
				changeAwaitingReview = false;
				changeRejected = false;
				userHasChangePending = false;
				userHasChangeAwaitingReview = false;
				userHasChangeRejected = false;

				let p = this.get('store').normalize('page', page.page);
				p = this.get('store').push(p);

				let m = this.get('store').normalize('page-meta', page.meta);
				m = this.get('store').push(m);

				let pending = A([]);
				page.pending.forEach((i) => {
					let p = this.get('store').normalize('page', i.page);
					p = this.get('store').push(p);

					let m = this.get('store').normalize('page-meta', i.meta);
					m = this.get('store').push(m);

					let belongsToMe = p.get('userId') === currentUserId;
					let pageStatus = p.get('status');

					let pi = {
						id: p.get('id'),
						page: p,
						meta: m,
						owner: i.owner,
						changePending: pageStatus === constants.ChangeState.Pending || pageStatus === constants.ChangeState.PendingNew,
						changeAwaitingReview: pageStatus === constants.ChangeState.UnderReview,
						changeRejected: pageStatus === constants.ChangeState.Rejected,
						userHasChangePending: belongsToMe && (pageStatus === constants.ChangeState.Pending || pageStatus === constants.ChangeState.PendingNew),
						userHasChangeAwaitingReview: belongsToMe && pageStatus === constants.ChangeState.UnderReview,
						userHasChangeRejected: belongsToMe && pageStatus === constants.ChangeState.Rejected
					};

					let pim = this.get('store').normalize('page-pending', pi);
					pim = this.get('store').push(pim);
					pending.pushObject(pim);

					if (p.get('status') === constants.ChangeState.Pending || p.get('status') === constants.ChangeState.PendingNew) {
						changePending = true;
						userHasChangePending = belongsToMe;
					}
					if (p.get('status') === constants.ChangeState.UnderReview) {
						changeAwaitingReview = true;
						userHasChangeAwaitingReview = belongsToMe;
					}
					if (p.get('status') === constants.ChangeState.Rejected) {
						changeRejected = p.get('status') === constants.ChangeState.Rejected;
						userHasChangeRejected = changeRejected && belongsToMe;
					}
				});

				let pi = {
					id: p.get('id'),
					page: p,
					meta: m,
					pending: pending,
					changePending: changePending,
					changeAwaitingReview: changeAwaitingReview,
					changeRejected: changeRejected,
					userHasChangePending: userHasChangePending,
					userHasChangeAwaitingReview: userHasChangeAwaitingReview,
					userHasChangeRejected: userHasChangeRejected,
					userHasNewPagePending: p.isNewPageUserPending(this.get('sessionService.user.id'))
				};

				let pim = this.get('store').normalize('page-container', pi);
				pim = this.get('store').push(pim);
				data.pushObject(pim);
			});

			return data;
		}).catch((error) => {
			return error;
		});
	},

    //**************************************************
    // Pinning documents inside spaces.
    //**************************************************

	// Pin document
    pin(documentId) {
        return this.get('ajax').request(`document/pin/${documentId}`, {
            method: 'POST'
        }).then((response) => {
            return response;
        });
    },

    // Unpin document
    unpin(documentId) {
        return this.get('ajax').request(`document/unpin/${documentId}`, {
            method: 'DELETE'
        }).then((response) => {
            return response;
        });
    },

    onPinSequence(documentId, direction) {
        return this.get('ajax').request(`document/pinmove/${documentId}?direction=${direction}`, {
            method: 'POST'
        }).then((response) => {
            return response;
        });
    }
});

function isObject(a) {
	return (!!a) && (a.constructor === Object);
}
