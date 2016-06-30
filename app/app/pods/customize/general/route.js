import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
    orgService: Ember.inject.service('organization'),
    appMeta: Ember.inject.service(),
    session: Ember.inject.service(),

    beforeModel()  {
        if (!this.get("session.isAdmin")) {
            this.transitionTo('auth.login');
        }
    },

    model() {
        let orgId = this.get("appMeta.orgId");
        return this.get('orgService').getOrg(orgId);
    },

    activate() {
        document.title = "Settings | Documize";
    }
});
