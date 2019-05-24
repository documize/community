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
import AuthMixin from '../../mixins/auth';
import Component from '@ember/component';

export default Component.extend(AuthMixin, {
	router: service(),
	documentSvc: service('document'),
	docs: null,
	space: null,

	didReceiveAttrs() {
		this._super(...arguments);

		this.get('documentSvc').getAllBySpace(this.get('space.id')).then((docs) => {
			this.set('docs', docs);
			this.classNames = ['dicon', this.get('constants').Icon.ArrowSmallDown];
		});
	},

	actions: {
		onSpace() {
			this.router.transitionTo('folder.index', this.space.id, this.space.slug);
		}
	}
});
