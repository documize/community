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

import Mixin from '@ember/object/mixin';
import { schedule } from '@ember/runloop';

export default Mixin.create({
	// e.g. #document-template-modal, #new-template-name
	modalInputFocus(modalId, inputId) {
		$(modalId).on('show.bs.modal', function(event) { // eslint-disable-line no-unused-vars
			schedule('afterRender', () => {
				$(inputId).focus();
			});
		});
	},

	// e.g. #document-template-modal
	modalClose(modalId) {
		$(modalId).modal('hide');
		$(modalId).modal('dispose');
	},

	// e.g. #document-template-modal
	modalOpen(modalId, options) {
		$(modalId).modal('dispose');
		$(modalId).modal(options);
	}
});
