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
	linkService: service('link'),
	folderService: service('folder'),
	userService: service('user'),
	localStore: service('local-storage'),
	contributionStatus: '',
	approvalStatus: '',

	beforeModel(transition) {
		// Note the source that sent user to this document.
		let source = transition.to.queryParams.source;
		if (_.isNull(source) || _.isUndefined(source)) source = "";

		return new EmberPromise((resolve) => {
			this.get('documentService').fetchPages(this.paramsFor('document').document_id, this.get('session.user.id'), source).then((data) => {
				this.set('pages', data);
				resolve();
			});
		});
	},

	model() {
		let document = this.modelFor('document').document;
		this.browser.setTitleWithoutSuffix(document.get('name'));
		this.browser.setMetaDescription(document.get('excerpt'));

		return hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			pages: this.get('pages'),
			links: this.modelFor('document').links,
			sections: this.modelFor('document').sections,
			permissions: this.modelFor('document').permissions,
			roles: this.modelFor('document').roles,
			blocks: this.modelFor('document').blocks,
			versions: this.modelFor('document').versions,
			attachments: this.modelFor('document').attachments
		});
	},

	setupController(controller, model) {
		this._super(controller, model);

		controller.set('folders', model.folders);
		controller.set('folder', model.folder);
		controller.set('document', model.document);
		controller.set('pages', model.pages);
		controller.set('links', model.links);
		controller.set('sections', model.sections);
		controller.set('permissions', model.permissions);
		controller.set('roles', model.roles);
		controller.set('blocks', model.blocks);
		controller.set('versions', model.versions);
		controller.set('attachments', model.attachments);

		// For persistence of section expand/collapse state.
		controller.set('expandState', this.get('localStore').getDocSectionHide(model.document.id));
	},

	activate: function () {
		this._super(...arguments);
		window.scrollTo(0, 0);
	}
});
