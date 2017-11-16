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

import Component from '@ember/component';
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';

export default Component.extend(NotifierMixin, TooltipMixin, {
	tab: 'index',

	didRender() {
		this._super(...arguments);

		if (this.get('permissions.documentEdit')) {
			this.addTooltip(document.getElementById("document-index-button"));
			this.addTooltip(document.getElementById("document-activity-button"));
		}
	},

	willDestroyElement() {
		this._super(...arguments);
		this.destroyTooltips();
	},

	actions: {
		onTabSwitch(tab) {
			this.set('tab', tab);
		},

		onPageSequenceChange(changes) {
			this.attrs.onPageSequenceChange(changes);
		},

		onPageLevelChange(changes) {
			this.attrs.onPageLevelChange(changes);
		},

		onGotoPage(id) {
			this.attrs.onGotoPage(id);
		}
	}
});
