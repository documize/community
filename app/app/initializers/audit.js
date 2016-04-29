
export function initialize(application) {
    application.inject('route', 'audit', 'service:audit');
    application.inject('controller', 'audit', 'service:audit');
    application.inject('component', 'audit', 'service:audit');
}

export default {
    name: 'audit',
    after: 'session',
    initialize: initialize
};
