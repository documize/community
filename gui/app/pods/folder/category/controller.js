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
	categorySvc: service('category'),
	refresh: 0,

	actions: {
		onAdd(c) {
			this.get('categorySvc').add(c).then(() => {
				this.set('refresh', this.get('refresh')+1);
			});
		}
	}
});
