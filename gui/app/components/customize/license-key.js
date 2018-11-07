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

import { empty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	global: service(),
	licenseError: empty('license'),
	subscription: null,
	planCloud: false,
	planSelfhost: false,

	didReceiveAttrs() {
		this._super(...arguments);
		this.get('global').getSubscription().then((subs) => {
			this.set('subscription', subs);
			if (subs.plan === 'Installed') {
				this.set('planCloud', false);
				this.set('planSelfhost', true);
			} else {
				this.set('planCloud', true);
				this.set('planSelfhost', false);
			}
		});
	},

	actions: {
		saveLicense() {
			this.showWait();

			this.get('global').setLicense(this.get('license')).then(() => {
				this.showDone();
				window.location.reload();
			});
		}
	}
});
