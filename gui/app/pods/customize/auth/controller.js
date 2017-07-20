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
// import constants from '../../../utils/constants';

export default Ember.Controller.extend(NotifierMixin, {
	global: Ember.inject.service(),
    appMeta: Ember.inject.service(),
	session: Ember.inject.service(),

	actions: {
		onSave(data) {
			return new Ember.RSVP.Promise((resolve) => {
				if(!this.get('session.isGlobalAdmin')) {
					resolve();
				} else {
					this.get('global').saveAuthConfig(data).then(() => {
						resolve();
					});
				}
			});
		},

		onSync() {
			return new Ember.RSVP.Promise((resolve) => {
				this.get('global').syncExternalUsers().then((response) => {
					resolve(response);
				});
			});			
		},

		onChange(data) {
			this.get('session').logout();
			this.set('appMeta.authProvider', data.authProvider);
			this.set('appMeta.authConfig', data.authConfig);
			window.location.href= '/';			
		}
	}
});
