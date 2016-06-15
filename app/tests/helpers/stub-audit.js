import Ember from 'ember';
// import netUtil from 'documize/utils/net';

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

        return id;

    },

    stop() {
    },

    start() {
        let session = this.get('sessionService');

        if (!this.get('enabled') || !session.authenticated || this.get('ready')) {
            return;
        }

        this.set('ready', true);
    },
});

export default Ember.Test.registerAsyncHelper('stubAudit', function(app, test, attrs = {}) {
    test.register('service:audit', Audit.extend(attrs));
});
