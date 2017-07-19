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
	session: Ember.inject.service(),
	localStorage: Ember.inject.service(),

	beforeModel() {
		this.get('localStorage').clearAll();
	},

	model: function (params) {
		this.set('folderId', params.id);
		this.set('slug', params.slug);
		this.set('serial', params.serial);
	},

	setupController(controller, model) {
		controller.set('model', model);
		controller.set('serial', this.serial);
		controller.set('slug', this.slug);
		controller.set('folderId', this.folderId);
	},

	activate() {
		$('body').addClass('background-color-off-white');
	},

	deactivate() {
		$('body').removeClass('background-color-off-white');
	}	
});