import Ember from 'ember';
import netUtil from 'documize/utils/net';
import config from 'documize/config/environment';

const Audit = Ember.Service.extend({
    sessionService: Ember.inject.service('session'),
    ready: false,
    enabled: true,

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

        // Intercom('trackEvent', id); //jshint ignore: line
        // Intercom('update'); //jshint ignore: line
    },

    stop() {
        // Intercom('shutdown'); //jshint ignore: line
    },

    start() {
        let session = this.get('sessionService');

        if (!this.get('enabled') || !session.authenticated || this.get('ready')) {
            return;
        }

        this.set('ready', true);

        let appId = config.environment === 'production' ? 'c6cocn4z' : 'itgvb1vo';

        // window.intercomSettings = {
        //     app_id: appId,
        //     name: session.user.firstname + " " + session.user.lastname,
        //     email: session.user.email,
        //     user_id: session.user.id,
        //     "administrator": session.user.admin,
        //     company:
        //     {
        //         id: session.get('appMeta.orgId'),
        //         name: session.get('appMeta.title').string,
        //         "domain": netUtil.getSubdomain(),
        //         "version": session.get('appMeta.version')
        //     }
        // };
        //
        // if (!session.get('isMobile')) {
        //     window.intercomSettings.widget = {
        //         activator: "#IntercomDefaultWidget"
        //     };
        // }
        //
        // window.Intercom('boot', window.intercomSettings);
    },
});

export default Ember.Test.registerAsyncHelper('stubAudit', function(app, test, attrs={}) {
    test.register('service:audit', Audit.extend(attrs));
});
