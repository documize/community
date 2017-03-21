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
import AuthMixin from '../../mixins/auth';

export default Ember.Controller.extend(AuthMixin, {
	tabGeneral: false,
	tabShare: false,
	tabPermissions: false,
	tabDelete: false,

	actions: {
		selectTab(tab) {
			this.set('tabGeneral', false);
			this.set('tabShare', false);
			this.set('tabPermissions', false);
			this.set('tabDelete', false);

			this.set(tab, true);
		}
	}
});