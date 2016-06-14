import Ember from 'ember';
import config from 'documize/config/environment';

export default Ember.Route.extend({
    activate: function(){
        this.session.logout();
        this.audit.record("logged-in");
        this.audit.stop();
        if (config.environment === 'test') {
            this.transitionTo('auth.login');
        }else{
            window.document.location = this.session.appMeta.allowAnonymousAccess ? "/" : "/auth/login";
        }
    }
});
