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
import AuthMixin from '../../mixins/auth';
import Component from '@ember/component';

export default Component.extend(AuthMixin, {
    localStorage: service(),
	viewDensity: "1",    
    
    didReceiveAttrs() {
		this._super(...arguments);

        let viewDensity = this.get('localStorage').getSessionItem('spaces.density');
		if (!_.isNull(viewDensity) && !_.isUndefined(viewDensity)) {
			this.set('viewDensity', viewDensity);
		}		
	},

    actions: {
		onSwitchView(v) {
			this.set('viewDensity', v);
			this.get('localStorage').storeSessionItem('spaces.density', v);
		}        
    }
});
