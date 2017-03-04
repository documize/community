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
	folderService: Ember.inject.service('folder'),
	sectionService: Ember.inject.service('section'),

	model(params) {
		let self = this;

		this.audit.record("edited-block");
 
		return Ember.RSVP.hash({
			folder: self.modelFor('document').folder,
			document: self.modelFor('document').document,
			block: self.get('sectionService').getBlock(params.block_id),
		});
	},

	activate() {
		$('body').addClass('background-color-off-white');
	},

	deactivate() {
		$('body').removeClass('background-color-off-white');
	}	
});
