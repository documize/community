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
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	documentService: Ember.inject.service('document'),
	folderService: Ember.inject.service('folder'),
	userService: Ember.inject.service('user'),

	model() {
		this.audit.record("viewed-document-attachments");

		return RSVP.hash({
			document: this.modelFor('document'),
			files: this.get('documentService').getAttachments(this.modelFor('document').get('id'))
		});
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set('isEditor', this.get('folderService').get('canEditCurrentFolder'));
	}
});
