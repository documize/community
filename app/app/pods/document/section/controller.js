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
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	documentService: Ember.inject.service('document'),

	actions: {
		onAction(page, meta) {
			let self = this;
			this.showNotification("Saving");

			let model = {
				page: page.toJSON({ includeId: true }),
				meta: meta.toJSON({ includeId: true })
			};

			this.get('documentService').updatePage(page.get('documentId'), page.get('id'), model).then(function (page) {
				self.audit.record("edited-page");
				let data = self.get('store').normalize('page', page);
				self.get('store').push(data);
			});
		},

		onDelete(document, page) {
			let self = this;

			this.get('documentService').deletePage(document.get('id'), page.get('id')).then(function () {
				page.deleteRecord();
				self.audit.record("deleted-page");
				self.showNotification('Deleted');
				self.transitionToRoute('document');
			});
		}
	}
});
