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
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {
	documentService: service('document'),
	folderService: service('folder'),
	templateService: service('template'),
	session: service(''),
	labelSvc: service('label'),

	beforeModel() {
		this.set('folderId', this.paramsFor('folder').folder_id)

		return new EmberPromise((resolve) => {
			this.get('folderService').getFolder(this.get('folderId')).then((folder) => {
				this.set('folder', folder);

				this.get('folderService').setCurrentFolder(folder).then((data) => {
					this.set('permissions', data);
					resolve();
				});
			});
		});
	},

	model(params) {
		return hash({
			folder: this.get('folder'),
			permissions: this.get('permissions'),
			folders: this.get('folderService').getAll(),
			documents: this.get('documentService').getAllBySpace(params.folder_id),
			templates: this.get('templateService').getSavedTemplates(params.folder_id),
			labels: this.get('labelSvc').getAll()
		});
	},

	actions: {
		error(error /*, transition*/ ) {
			console.log(error); // eslint-disable-line no-console
			if (error) {
				this.transitionTo('/not-found');
				return false;
			}
		}
	}
});
