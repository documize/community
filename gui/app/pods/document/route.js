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

import { Promise as EmberPromise, hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	sectionService: service('section'),
	documentService: service('document'),
	folderService: service('folder'),
	linkService: service('link'),

	beforeModel() {
		this.set('folderId', this.paramsFor('document').folder_id);
		this.set('documentId', this.paramsFor('document').document_id);

		return new EmberPromise((resolve) => {
			this.get('documentService').fetchDocumentData(this.get('documentId')).then((data) => {
				this.set('document', data.document);
				this.set('folders', data.folders);
				this.set('folder', data.folder);
				this.set('permissions', data.permissions);
				this.set('roles', data.roles);
				this.set('links', data.links);
				this.set('versions', data.versions);
				this.set('attachments', data.attachments);
				resolve();
			});
		});
	},

	model() {
		return hash({
			folders: this.get('folders'),
			folder: this.get('folder'),
			document: this.get('document'),
			permissions: this.get('permissions'),
			roles: this.get('roles'),
			links: this.get('links'),
			versions: this.get('versions'),
			attachments: this.get('attachments'),
			sections: this.get('sectionService').getAll(),
			blocks: this.get('sectionService').getSpaceBlocks(this.get('folder.id'))
		});
	},

	actions: {
		error(error /*, transition*/) {
			if (error) {
				this.transitionTo('/not-found');
				return false;
			}
		}
	}
});
