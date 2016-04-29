import Ember from 'ember';

export default Ember.Route.extend({
    orgService: Ember.inject.service('organization'),

    beforeModel()  {
        if (!this.session.isAdmin) {
            this.transitionTo('auth.login');
        }
    },

    model() {
        return this.get('orgService').getOrg(this.session.appMeta.get('orgId'));
    },

    activate() {
        document.title = "Settings | Documize";
    }
});
