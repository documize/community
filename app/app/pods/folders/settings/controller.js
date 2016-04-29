import Ember from 'ember';

export default Ember.Controller.extend({
	tabGeneral: false,
	tabShare: false,
	tabPermissions: false,
	tabDelete: false,

	actions: {
		selectTab(tab) {
			this.set('tabGeneral', false);
			this.set('tabShare', false);
			this.set('tabPermissions', false);
			this.set('tabDelete', false);

			this.set(tab, true);
		}
	}
});
