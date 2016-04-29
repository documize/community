import Ember from 'ember';

export default Ember.Route.extend({
    activate: function(){
        this.session.logout();
        this.audit.record("logged-in");
        this.audit.stop();
        window.document.location = this.session.appMeta.allowAnonymousAccess ? "/" : "/auth/login";
    }
});
