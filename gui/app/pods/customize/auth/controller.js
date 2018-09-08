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

import { Promise as EmberPromise } from 'rsvp';
import { inject as service } from '@ember/service';
import NotifierMixin from "../../../mixins/notifier";
import Controller from '@ember/controller';

export default Controller.extend(NotifierMixin, {
	global: service(),
	appMeta: service(),
	session: service(),

	actions: {
		onSave(data) {
			return new EmberPromise((resolve) => {
				if (!this.get('session.isGlobalAdmin')) {
					resolve();
				} else {
					this.get('global').saveAuthConfig(data).then(() => {
						resolve();
					});
				}
			});
		},

		onSyncKeycloak() {
			return new EmberPromise((resolve) => {
				this.get('global').syncKeycloak().then((response) => {
					resolve(response);
				});
			});
		},

		onSyncLDAP() {
			return new EmberPromise((resolve) => {
				this.get('global').syncLDAP().then((response) => {
					resolve(response);
				});
			});
		},

		onChange(data) {
			this.get('session').logout();
			this.set('appMeta.authProvider', data.authProvider);
			this.set('appMeta.authConfig', data.authConfig);
			window.location.href = '/';
		}
	}
});
