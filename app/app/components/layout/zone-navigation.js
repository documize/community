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
import netUtil from '../../utils/net';

export default Ember.Component.extend({
	folderService: Ember.inject.service('folder'),
	folder: null,

    didInitAttrs() {
        let self = this;
        if (this.session.authenticated) {
            this.session.user.accounts.forEach(function(account) {
                account.active = account.orgId === self.session.appMeta.orgId;
            });
        }
    },

	didReceiveAttrs() {
		if (this.get('folder') === null) {
			this.set("folder", this.get('folderService.currentFolder'));
		}
	},

    actions: {
        switchAccount(domain) {
            this.audit.record('switched-account');
            window.location.href = netUtil.getAppUrl(domain);
        }
    }
});
