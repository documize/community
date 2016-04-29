export function initialize(application) {
    application.inject('route', 'browser', 'service:browser');
    application.inject('controller', 'browser', 'service:browser');
    application.inject('component', 'browser', 'service:browser');
}

export default {
    name: 'browser',
    after: "session",
    initialize: initialize
};
