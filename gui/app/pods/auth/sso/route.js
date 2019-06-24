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
import Route from '@ember/routing/route';

export default Route.extend({
	globalSvc: service('global'),
	session: service(),
	localStorage: service(),

	beforeModel(transition) {
		this.get('localStorage').clearAll();

		if (!_.isUndefined(transition.to.queryParams.fr)) {
			this.get('localStorage').setFirstRun();
		}
	},

	model({ token }) {
		this.get("session").authenticate('authenticator:documize', decodeURIComponent(token))
			.then(() => {
				if (this.get('localStorage').isFirstRun()) {
					this.get('globalSvc').onboard().then(() => {
						this.transitionTo('folders');
					}).catch(() => {
						this.transitionTo('folders');
					});
				} else {
					this.transitionTo('folders');
				}
			}, () => {
				this.transitionTo('auth.login');
			});
	},

	activate() {
		this.get('browser').setTitle('SSO');
	}
});
