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

import { inject as service } from '@ember/service';
import NotifierMixin from '../../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(NotifierMixin, {
	router: service(),
	folderService: service('folder'),
	localStorage: service('localStorage'),
	appMeta: service(),
	queryParams: ['tab'],
	tab: 'general',

	actions: {
		onBack() {
			this.get('router').transitionTo('folder.index');
		},

		onTab(view) {
			this.set('tab', view);
		},

		onRefresh() {
			this.get('target._routerMicrolib').refresh();
		}
	}
});
