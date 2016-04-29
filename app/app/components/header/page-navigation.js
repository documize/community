// Copyright (c) 2015 Documize Inc.
import Ember from 'ember';
import netUtil from '../../utils/net';

export default Ember.Component.extend({
	dashboardMode: false,
	searchMode: false,
	profileMode: false,
	settingsMode: false,
	folderMode: false,
    documentMode: false,

    didInitAttrs() {
        let self = this;
        if (this.session.authenticated) {
            this.session.user.accounts.forEach(function(account) {
                account.active = account.orgId === self.session.appMeta.orgId;
            });
        }
    },

    actions: {
        switchAccount(domain) {
            this.audit.record('switched-account');
			window.location.href = netUtil.getAppUrl(domain);
        }
    }
});
