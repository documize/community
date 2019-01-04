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

import { hash } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {
	model() {
		this.get('browser').setTitle(this.modelFor('folder').folder.get('name'));

		return hash({
			folder: this.modelFor('folder').folder,
			folders: this.modelFor('folder').folders,
			permissions: this.modelFor('folder').permissions,
			templates: this.modelFor('folder').templates,
			labels: this.modelFor('folder').labels,
		});
	}
});
