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

export default Component.extend({
	data: "",

	didReceiveAttrs() {
		this._super();

		this.set("data", this.get("meta.rawBody"));
	},

	actions: {
		isDirty() {
			return this.get('meta.rawBody') !== this.get('data');
		},

		onCancel() {
			let cb = this.get('onCancel');
			cb();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('rawBody', this.get("data"));

			let cb = this.get('onAction');
			cb(page, meta);
		}
	}
});
