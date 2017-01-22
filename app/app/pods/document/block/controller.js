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
	sectionService: Ember.inject.service('section'),

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

			let block = this.get('model.block');
			block.set('title', page.get('title'));
			block.set('body', page.get('body'));
			block.set('excerpt', page.get('excerpt'));
			block.set('rawBody', meta.get('rawBody'));
			block.set('config', meta.get('config'));
			block.set('externalSource', meta.get('externalSource'));

			this.get('sectionService').updateBlock(block).then(function () {
				self.audit.record("edited-block");
				self.transitionToRoute('document', {
					queryParams: {
						page: page.get('id')
					}
				});
			});
		}
	}
});
