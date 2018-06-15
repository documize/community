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
import Mixin from '@ember/object/mixin';
import { schedule } from '@ember/runloop';

export default Mixin.create({
	renderTooltips() {
		schedule('afterRender', () => {
			$('[data-toggle="tooltip"]').tooltip('dispose');
			$('body').tooltip({selector: '[data-toggle="tooltip"]', delay: 250});
		});
	},

	removeTooltips() {
		$('[data-toggle="tooltip"]').tooltip('dispose');
	},

	renderPopovers() {
		schedule('afterRender', () => {
			$('[data-toggle="popover"]').popover('dispose');
			$('body').popover({selector: '[data-toggle="popover"]', delay: 250});
		});
	},

	removePopovers() {
		$('[data-toggle="tooltip"]').popover('dispose');
	}
});
