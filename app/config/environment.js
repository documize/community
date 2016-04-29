/* jshint node: true */

module.exports = function(environment) {
    var ENV = {
        modulePrefix: 'documize',
        podModulePrefix: 'documize/pods',
        locationType: 'history',
        environment: environment,
        baseURL: '/',
        apiHost: '',
        apiNamespace: '',

        EmberENV: {
            FEATURES: {}
        },
        APP: {}
    };

    if (environment === 'development') {
        ENV.APP.LOG_TRANSITIONS = true;
        ENV.APP.LOG_TRANSITIONS_INTERNAL = true;

        ENV.apiHost = "https://localhost:5001";
        // ENV.apiHost = "https://demo1.dev:5001";
    }

    if (environment === 'test') {
        ENV.APP.LOG_RESOLVER = false;
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;
        // ENV.APP.LOG_TRANSITIONS = false;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
        ENV.APP.LOG_TRANSITIONS = true;
        ENV.APP.LOG_TRANSITIONS_INTERNAL = true;

        // ENV.baseURL = '/';
        // ENV.locationType = 'none';
        // ENV.APP.rootElement = '#ember-testing';

        ENV.apiHost = "https://demo1.dev:5001";
    }

    if (environment === 'production') {
        ENV.APP.LOG_RESOLVER = false;
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;
        ENV.APP.LOG_TRANSITIONS = false;
        ENV.APP.LOG_TRANSITIONS_INTERNAL = false;

        ENV.apiHost = "";
    }

    ENV.apiNamespace = "api";

    // ENV.contentSecurityPolicy = {
    //     'img-src': "'self' data: self https://js.intercomcdn.com",
    //     'font-src': "'self' data: fonts.gstatic.com",
    //     'style-src': "'self' 'unsafe-inline' fonts.googleapis.com",
    //     'script-src': "'self' https://widget.intercom.io https://js.intercomcdn.com " + ENV.apiHost,
    //     'connect-src': "'self' " + ENV.apiHost + " https://api-ping.intercom.io https://nexus-websocket-a.intercom.io https://nexus-websocket-b.intercom.io wss://nexus-websocket-a.intercom.io wss://nexus-websocket-b.intercom.io https://api-iam.intercom.io",
    //     'default-src': "none"
    // };

    return ENV;
};

// contentSecurityPolicy: {
//     'img-src': "'self' data: self",
//     'font-src': "'self' data: fonts.gstatic.com",
//     'style-src': "'self' 'unsafe-inline' fonts.googleapis.com",
//     'script-src': "'self' 'unsafe-inline' 'unsafe-eval' *",
//     'connect-src': "'self'",
//     'default-src': "none"
// },