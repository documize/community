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

export default Ember.Controller.extend(NotifierMixin, {
	global: Ember.inject.service(),

	actions: {
		saveSMTP() {
			if(this.get('session.isGlobalAdmin')) {
				return this.get('global').saveSMTPConfig(this.model.smtp).then(() => {
					this.showNotification('Saved');
				});
			}
		},

		saveLicense() {
			if(this.get('session.isGlobalAdmin')) {
				return this.get('global').saveLicense(this.model.license).then(() => {
					this.showNotification('Saved');
				});
			}
		}
	}
});
