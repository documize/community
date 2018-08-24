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

import Service, { inject as service } from '@ember/service';
import Notifier from '../mixins/notifier';

export default Service.extend(Notifier, {
	sessionService: service('session'),
	ajax: service(),
	appMeta: service(),
	store: service(),
	eventBus: service(),

	// Returns links within specified document
	getDocumentLinks(documentId) {
		return this.get('ajax').request(`documents/${documentId}/links`, {
			method: "GET"
		});
	},

	// Returns candidate links using provided parameters
	getCandidates(folderId, documentId, pageId) {
		return this.get('ajax').request(`links/${folderId}/${documentId}/${pageId}`, {
			method: 'GET'
		}).then((response) => {
			return response;
		});
	},

	// Returns keyword-based candidates
	searchCandidates(keywords) {
		let url = "links?keywords=" + encodeURIComponent(keywords);

		return this.get('ajax').request(url, {
			method: 'GET'
		}).then((response) => {
			return response;
		});
	},

	// getUsers returns all users for organization.
	find(keywords) {
		let url = "search?keywords=" + encodeURIComponent(keywords);

		return this.get('ajax').request(url, {
			method: "GET"
		});
	},

	buildLink(link) {
		let result = "";
		let href = "";
		let endpoint = this.get('appMeta').get('endpoint');
		let orgId = this.get('appMeta').get('orgId');

		if (link.linkType === "section" || link.linkType === "tab" || link.linkType === "document") {
			href = `/link/${link.linkType}/${link.id}`;
			result = `<a data-documize='true' data-link-space-id='${link.folderId}' data-link-id='${link.id}' data-link-target-document-id='${link.documentId}' data-link-target-id='${link.targetId}' data-link-type='${link.linkType}' href='${href}'>${link.title}</a>`;
		}
		if (link.linkType === "file") {
			href = `${endpoint}/public/attachments/${orgId}/${link.targetId}`;
			result = `<a data-documize='true' data-link-space-id='${link.folderId}' data-link-id='${link.id}' data-link-target-document-id='${link.documentId}' data-link-target-id='${link.targetId}' data-link-type='${link.linkType}' href='${href}'>${link.title}</a>`;
		}
		if (link.linkType === "network") {
			href = `fileto://${link.externalId}`;
			result = `<a data-documize='true' data-link-space-id='${link.folderId}' data-link-id='${link.id}' data-link-target-document-id='${link.documentId}' data-link-target-id='${link.targetId}' data-link-external-id='${link.externalId}' data-link-type='${link.linkType}' href='${href}'>${link.title}</a>`;
		}

		return result;
	},

	getLinkObject(outboundLinks, a) {
		let link = {
			linkId: a.attributes["data-link-id"].value,
			linkType: a.attributes["data-link-type"].value,
			documentId: a.attributes["data-link-target-document-id"].value,
			folderId: a.attributes["data-link-space-id"].value,
			targetId: a.attributes["data-link-target-id"].value,
			externalId: is.undefined(a.attributes["data-link-external-id"]) ? '' : a.attributes["data-link-external-id"].value,
			url: a.attributes["href"].value,
			orphan: false
		};

		link.orphan = _.isEmpty(link.linkId) || _.isEmpty(link.documentId) || _.isEmpty(link.folderId) || (_.isEmpty(link.targetId) && _.isEmpty(link.externalId));

		// we check latest state of link using database data
		let existing = outboundLinks.findBy('id', link.linkId);

		if (_.isUndefined(existing)) {
			link.orphan = true;
		} else {
			link.orphan = existing.orphan;
		}

		return link;
	},

	linkClick(doc, link) {
		if (link.orphan) {
			return;
		}

		let router = this.get('router');
		let targetFolder = this.get('store').peekRecord('folder', link.folderId);
		let targetDocument = this.get('store').peekRecord('document', link.documentId);
		let folderSlug = is.null(targetFolder) ? "s" : targetFolder.get('slug');
		let documentSlug = is.null(targetDocument) ? "d" : targetDocument.get('slug');

		// handle section link
		if (link.linkType === "section" || link.linkType === "tab") {
			let options = {};
			options['pageId'] = link.targetId;
			router.transitionTo('document', link.folderId, folderSlug, link.documentId, documentSlug, { queryParams: options });
			return;
		}

		// handle document link
		if (link.linkType === "document") {
			router.transitionTo('document', link.folderId, folderSlug, link.documentId, documentSlug);
			return;
		}

		// handle attachment links
		if (link.linkType === "file") {
			window.location.href = link.url;
			return;
		}

		// handle network share/drive links
		if (link.linkType === "network") {
			// window.location.href = link.externalId;
			const el = document.createElement('textarea');
			el.value = link.externalId;
			el.setAttribute('readonly', '');
			el.style.position = 'absolute';
			el.style.left = '-9999px';
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);

			this.showNotification('Copied location to clipboard');

			return;
		}
	}
});
