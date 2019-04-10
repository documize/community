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

import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {
	linkSvc: service('link'),
	jumpToLink: '',

	beforeModel: function () {
		// let jumpType = this.paramsFor('jumpto').jump_type;
		let jumpId = this.paramsFor('jumpto').jump_id;

		return new Promise((resolve) => {
			this.get('linkSvc').fetchLinkUrl(jumpId).then((link) => {
				this.set('jumpToLink', link);
				resolve();
			});
		});
	},

	model: function () {
		let link = this.get('jumpToLink');
		window.location.href = link;
	}
});
