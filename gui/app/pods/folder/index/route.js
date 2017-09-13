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
	model() {
		this.get('browser').setTitle(this.modelFor('folder').folder.get('name'));

		return Ember.RSVP.hash({
			folder: this.modelFor('folder').folder,
			isEditor: this.modelFor('folder').isEditor,
			isFolderOwner: this.modelFor('folder').isFolderOwner,
			folders: this.modelFor('folder').folders,
			documents: this.modelFor('folder').documents,
			templates: this.modelFor('folder').templates
		});
	}
});
