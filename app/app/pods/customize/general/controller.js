import Ember from 'ember';
import NotifierMixin from "../../../mixins/notifier";

export default Ember.Controller.extend(NotifierMixin, {
    orgService: Ember.inject.service('organization'),

    actions: {
        save() {
            if (is.empty(this.model.get('title'))) {
				$("#siteTitle").addClass("error").focus();
                return;
            }

			if (is.empty(this.model.get('message'))) {
				$("#siteMessage").addClass("error").focus();
                return;
            }

            this.model.set('allowAnonymousAccess', Ember.$("#allowAnonymousAccess").prop('checked'));
            this.get('orgService').save(this.model);
            this.showNotification('Saved');
        }
    }
});
