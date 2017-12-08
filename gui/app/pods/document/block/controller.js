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
import Controller from '@ember/controller';

export default Controller.extend({
	sectionService: service('section'),

	actions: {
		onCancel( /*page*/ ) {
			this.transitionToRoute('document');
		},

		onAction(page, meta) {
			let self = this;

			let b = this.get('model.block');
			b.set('title', page.get('title'));
			b.set('body', page.get('body'));
			b.set('excerpt', page.get('excerpt'));
			b.set('rawBody', meta.get('rawBody'));
			b.set('config', meta.get('config'));
			b.set('externalSource', meta.get('externalSource'));

			this.get('sectionService').updateBlock(b).then(function () {
				self.transitionToRoute('document');
			});
		}
	}
});
