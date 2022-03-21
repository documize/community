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
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
	i18n: service(),

	model: function (params) {
		return params.token;
	},

	activate() {
		this.get('browser').setTitleAsPhrase(this.i18n.localize('reset_password'));
		$('body').addClass('background-color-theme-100 d-flex justify-content-center align-items-center');
	},

	deactivate() {
		$('body').removeClass('background-color-theme-100 d-flex justify-content-center align-items-center');
	}
});
