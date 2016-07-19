import Ember from 'ember';

/**
 * This is a work around problems that tether introduces into testing.
 * TODO: remove this code and refactor in favour of ember-tether
 */
export default Ember.Service.extend({
	createDrop() {
		if (Ember.testing) {
			return;
		}

		return new Drop(...arguments);
	},
	createTooltip() {
		if (Ember.testing) {
			return;
		}

		return new Tooltip(...arguments);
	}
});
