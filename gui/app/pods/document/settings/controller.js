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
import Notifier from '../../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(Notifier, {
	router: service(),
	appMeta: service(),
	folderService: service('folder'),
	documentService: service('document'),
	localStorage: service('localStorage'),
	i18n: service(),
	queryParams: ['tab'],
	tab: 'general',

	actions: {
		onBack() {
			this.get('router').transitionTo('document.index');
		},

		onTab(view) {
			this.set('tab', view);
		},

		onSaveDocument(doc) {
			this.get('documentService').save(doc).then(() => {
				this.notifySuccess(this.i18n.localize('saved'));
			});

			this.get('browser').setTitle(doc.get('name'));
			this.get('browser').setMetaDescription(doc.get('excerpt'));
		},

		onRefresh() {
			this.get('target._routerMicrolib').refresh();
		}
	}
});
