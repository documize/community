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
	appMeta: service(),

	// Returns candidate links using provided parameters
	getCandidates(documentId, pageId /*, keywords*/ ) {
		return this.get('ajax').request(`links/${documentId}/${pageId}`, {
			method: 'GET'
		}).then((response) => {
			return response;
		});
	},

	buildLink(link) {
		let result = "";
		let href = "";
		let endpoint = this.get('appMeta').get('endpoint');
		let orgId = this.get('appMeta').get('orgId');

		if (link.linkType === "section") {
			href = `/link/${link.linkType}/${link.id}`;
		}
		if (link.linkType === "file") {
			href = `${endpoint}/public/attachments/${orgId}/${link.targetId}`;
		}
		if (link.linkType === "document") {
			href = `/link/${link.linkType}/${link.id}`;
		}

		result = `<a data-documize='true' data-link-id='${link.id}' data-link-document-id='${link.documentId}' data-link-target-id='${link.targetId}' data-link-type='${link.linkType}' href='${href}'>${link.title}</a>`;

		return result;
	}
});

/*

link handler
	- implement link redirect handler --
		- for documents: client-side detect
		- for sections:
		- for attachments: direct link
	-

onDelete document/section/file:
	- mark link table row as ORPHAN
	- doc view: meta data fetch to load orphaned content

Keyword search results - docs, section, files

we should not redirect to a link that is in the same document!
what happens if we delete attachment?
UpdatePage(): find and persist links from saved content

1. We need to deal with links server-side
2. We need to click on links in the browser and 'navigate' to linked content

editor.insertContent('&nbsp;<b>It\'s my button!</b>&nbsp;');
Selects the first paragraph found
tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
*/
