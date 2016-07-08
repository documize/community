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
	orgService: Ember.inject.service('organization'),

	actions: {
		save() {
			if (is.empty(this.model.get('title'))) {
				$("#siteTitle").addClass("error").focus();
				return;
			}

			if (is.empty(this.model.get('message'))) {
				$("#siteMessage").addClass("error").focus();
				return;
			}

			this.model.set('allowAnonymousAccess', Ember.$("#allowAnonymousAccess").prop('checked'));
			this.get('orgService').save(this.model);
			this.showNotification('Saved');
		}
	}
});