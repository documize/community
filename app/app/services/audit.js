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
import netUtil from '../utils/net';
import config from '../config/environment';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),
    ready: false,
    enabled: config.APP.auditEnabled,
	appId: config.APP.intercomKey,

    init() {
        this.start();
    },

    record(id) {
        if (!this.get('enabled')) {
            return;
        }

        if (!this.get('ready')) {
            this.start();
        }

        Intercom('trackEvent', id); //jshint ignore: line
        Intercom('update'); //jshint ignore: line
    },

    stop() {
        Intercom('shutdown'); //jshint ignore: line
    },

    start() {
        let session = this.get('sessionService');

        if (this.get('appId') === "" || !this.get('enabled') || !session.authenticated || this.get('ready')) {
            return;
        }

        this.set('ready', true);

        window.intercomSettings = {
            app_id: this.get('appId'),
            name: session.user.firstname + " " + session.user.lastname,
            email: session.user.email,
            user_id: session.user.id,
            "administrator": session.user.admin,
            company: {
                id: session.get('appMeta.orgId'),
                name: session.get('appMeta.title').string,
                "domain": netUtil.getSubdomain(),
                "version": session.get('appMeta.version')
            }
        };

        if (!session.get('isMobile')) {
            window.intercomSettings.widget = {
                activator: "#IntercomDefaultWidget"
            };
        }

        window.Intercom('boot', window.intercomSettings);
    },
});
