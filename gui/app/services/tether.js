// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

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
