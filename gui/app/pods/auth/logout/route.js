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
// import config from 'documize/config/environment';

export default Route.extend({
	session: service(),
	appMeta: service(),

	activate: function () {
		this.get('session').invalidate().then(() => {
			// if (config.environment === 'test') {
			// 	this.transitionTo('auth.login');
			// } else {
			// 	if (this.get("appMeta.allowAnonymousAccess")) {
			// 		this.transitionTo('folders');
			// 	} else {
			// 		this.transitionTo('auth.login');
			// 	}
			// }
		});
	}
});
