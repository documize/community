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
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	orgSvc: service('organization'),
	appMeta: service(),

	didReceiveAttrs() {
		this._super(...arguments);

		// Jira specific.
		let jira = this.get('jira');

		if (_.isEmpty(jira) || !_.isObject(jira)) {
			jira = {
				url: '',
				username: '',
				secret: ''
			};
		}

		this.set('jiraCreds', jira);

		if (this.get('session.isGlobalAdmin')) {
			// Trello specific.
			let trello = this.get('trello');

			if (!_.isObject(trello)) {
				trello = {
					appKey: ''
				};
			}

			this.set('trelloCreds', trello);
		}

		let flowchart = this.get('flowchart');
		if (_.isEmpty(flowchart) || !_.isObject(flowchart)) {
			flowchart = {
				url: '',
			};
		}
		this.set('flowchart', flowchart);
	},

	actions: {
		onSave() {
			let orgId = this.get("appMeta.orgId");
			let url = this.get('jiraCreds.url');

			if (_.endsWith(url, '/')) {
				this.set('jiraCreds.url', url.substring(0, url.length-1));
			}

			this.get('orgSvc').saveOrgSetting(orgId, 'jira', this.get('jiraCreds')).then(() => {
				if (this.get('session.isGlobalAdmin')) {
					this.get('orgSvc').saveGlobalSetting('SECTION-TRELLO', this.get('trelloCreds'));
				}

				this.get('orgSvc').saveOrgSetting(orgId, 'flowchart', this.get('flowchart'));

				this.notifySuccess(this.i18n.localize('saved'));
			});
		}
	}
});
