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
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	documentService: Ember.inject.service('document'),

	model() {
		this.audit.record("viewed-document-activity");

		return Ember.RSVP.hash({
			folders: this.modelFor('document').folders,
			folder: this.modelFor('document').folder,
			document: this.modelFor('document').document,
			isEditor: this.modelFor('document').isEditor,
			pages: this.modelFor('document').allPages,
			tabs: this.modelFor('document').tabs,
			activity: this.get('documentService').getMeta(this.modelFor('document').document.get('id')).then((activity) => {
				return activity;
			})
		});
	}
});
