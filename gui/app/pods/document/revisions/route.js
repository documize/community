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
import { Promise as EmberPromise, hash } from 'rsvp';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {
	docSvc: service('document'),
	linkService: service('link'),
	folderService: service('folder'),
	userService: service('user'),

	beforeModel() {
		return new EmberPromise((resolve) => {
			let doc = this.modelFor('document').document;

			this.get('docSvc').getDocumentRevisions(doc.get('id')).then((revisions) => {
				revisions.forEach((r) => {
					set(r, 'deleted', r.revisions === 0);
				});

				this.set('revisions', revisions);

				resolve(revisions);
			});
		});
	},

	model() {
		return hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			pages: this.get('pages'),
			permissions: this.modelFor('document').permissions,
			roles: this.modelFor('document').roles,
			revisions: this.get('revisions')
		});
	},

	setupController(controller, model) {
		this._super(controller, model);

		controller.set('folders', model.folders);
		controller.set('folder', model.folder);
		controller.set('document', model.document);
		controller.set('pages', model.pages);
		controller.set('permissions', model.permissions);
		controller.set('roles', model.roles);
		controller.set('revisions', model.revisions);

		if (model.revisions.length > 0) {
			controller.set('selectedRevision', model.revisions[0]);
		}
	},

	activate: function () {
		this._super(...arguments);

		let document = this.modelFor('document').document;
		this.browser.setTitleWithoutSuffix(document.get('name'));
		this.browser.setMetaDescription(document.get('excerpt'));
	}
});
