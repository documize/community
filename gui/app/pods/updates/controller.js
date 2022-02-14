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

import $ from 'jquery';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
	appMeta: service(),
	session: service(),
	newsContent: '',

	init() {
		this._super(...arguments);

		let version = this.get('appMeta.version');
		let edition = encodeURIComponent(this.get('appMeta.edition').toLowerCase());
		let self = this;
		let cacheBuster = + new Date();

		$.ajax({
			url: `https://www.documize.com/community/news/${edition}/${version}.html?cb=${cacheBuster}`,
			type: 'GET',
			dataType: 'html',
			success: function (response) {
				if (self.get('isDestroyed') || self.get('isDestroying')) return;
				self.set('newsContent', response);
			}
		});
	}
});
