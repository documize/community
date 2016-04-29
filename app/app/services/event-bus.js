import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
    publish: function() {
        return this.trigger.apply(this, arguments);
    },

    subscribe: function() {
        return this.on.apply(this, arguments);
    },

    unsubscribe: function() {
        return this.off.apply(this, arguments);
    }
});
