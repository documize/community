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
import { empty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	LicenseError: empty('model.license'),
	changelog: '',

	init() {
		this._super(...arguments);

		let self = this;
		let cacheBuster = + new Date();
		$.ajax({
			url: `https://storage.googleapis.com/documize/news/summary.html?cb=${cacheBuster}`,
			type: 'GET',
			dataType: 'html',
			success: function (response) {
				self.set('changelog', response);
			}
		});
	},

	actions: {
		saveLicense() {
			this.showWait();
			this.get('saveLicense')().then(() => {
				this.showDone();
				window.location.reload();
			});
		}
	}
});
