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
import TooltipMixin from '../../mixins/tooltip';
import NotifierMixin from '../../mixins/notifier';
import AuthMixin from '../../mixins/auth';

export default Ember.Component.extend(TooltipMixin, NotifierMixin, AuthMixin, {
	tab: '',

	init() {
		this._super(...arguments);

		if (is.empty(this.get('tab')) || is.undefined(this.get('tab'))) {
			this.set('tab', 'index');
		}
	},

	actions: {
		onAddSpace(m) {
			this.attrs.onAddSpace(m);
			return true;
		},

		onChangeTab(tab) {
			this.set('tab', tab);
		},
	}
});
