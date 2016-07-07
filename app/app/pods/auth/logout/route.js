import Ember from 'ember';
import config from 'documize/config/environment';

export default Ember.Route.extend({
    session: Ember.inject.service(),
    appMeta: Ember.inject.service(),

    activate: function(){
        this.get('session').invalidate();
        this.audit.record("logged-in");
        this.audit.stop();
        if (config.environment === 'test') {
            this.transitionTo('auth.login');
        }else{
            window.document.location = this.get("appMeta.allowAnonymousAccess") ? "/" : "/auth/login";
        }
    }
});
