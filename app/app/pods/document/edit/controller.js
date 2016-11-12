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

export default Ember.Controller.extend({
	documentService: Ember.inject.service('document'),

	actions: {
		onCancel( /*page*/ ) {
			this.transitionToRoute('document', {
				queryParams: {
					page: this.get('model.page.id')
				}
			});
		},

		onAction(page, meta) {
			let self = this;
			let model = {
				page: page.toJSON({ includeId: true }),
				meta: meta.toJSON({ includeId: true })
			};

			this.get('documentService').updatePage(page.get('documentId'), page.get('id'), model).then(function () {
				self.audit.record("edited-page");
				self.transitionToRoute('document', {
					queryParams: {
						page: page.get('id')
					}
				});
			});
		}
	}
});
