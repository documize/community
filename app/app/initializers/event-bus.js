export function initialize(application) {
    application.inject('route', 'eventBus', 'service:eventBus');
    application.inject('component', 'eventBus', 'service:eventBus');
    application.inject('controller', 'eventBus', 'service:eventBus');
    application.inject('mixin', 'eventBus', 'service:eventBus');
}

export default {
    name: 'eventBus',
    after: 'session',
    initialize: initialize
};
