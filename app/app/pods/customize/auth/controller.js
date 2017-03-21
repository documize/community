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
import NotifierMixin from "../../../mixins/notifier";
import constants from '../../../utils/constants';

export default Ember.Controller.extend(NotifierMixin, {
	global: Ember.inject.service(),
    appMeta: Ember.inject.service(),
	session: Ember.inject.service(),

	handleProviderChange(data) {
		this.get('session').logout();
		this.set('appMeta.authProvider', data.authProvider);
		this.set('appMeta.authConfig', data.authConfig);
		window.location.href= '/';
	},

	actions: {
		onSave(provider, config) {
			if(this.get('session.isGlobalAdmin')) {
				let data = { authProvider: provider, authConfig: JSON.stringify(config) };

				return this.get('global').saveAuthConfig(data).then(() => {
					this.showNotification('Saved');

					if (provider !== this.get('appMeta.authProvider')) {
						if (provider === constants.AuthProvider.Keycloak) {
							this.get('global').syncExternalUsers().then(() => {
								this.handleProviderChange(data);
							});
						} else {
							this.handleProviderChange(data);
						}
					} else {
						this.set('appMeta.authProvider', provider);
						this.set('appMeta.authConfig', config);
					}
				});
			}
		},

		onSync() {
			return this.get('global').syncExternalUsers().then((response) => {
				this.showNotification(response.message);
			});
		}
	}
});
