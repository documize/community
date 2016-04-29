export function initialize(application) {
    application.inject('route', 'logger', 'service:logger');
    application.inject('component', 'logger', 'service:logger');
    application.inject('controller', 'logger', 'service:logger');
}

export default {
    name: 'logger',
    after: 'session',
    initialize: initialize
};
