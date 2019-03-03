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

// ID values expected format:
// 		modal: #document-template-modal
// 		element: #new-template-name
// See https://getbootstrap.com/docs/4.0/components/modal/#via-javascript
export default Mixin.create({
	modalOpen(modalId, options, focusId) {
		$(modalId).modal('dispose');
		$(modalId).modal(options);

		if (!_.isUndefined(focusId)) {
			$(focusId).trigger('focus');
		}
	},

	modalInputFocus(modalId, inputId) {
		$(modalId).one('shown.bs.modal', function(event) { // eslint-disable-line no-unused-vars
			$(inputId).trigger('focus');
		});
	},

	// Destroys the element’s modal.
	modalDispose(modalId) {
		$(modalId).modal('dispose');
	},

	// Manually hides a modal. Returns to the caller before the modal has actually
	// been hidden (i.e. before the hidden.bs.modal event occurs).
	modalHide(modalId) {
		$(modalId).modal('hide');
	},

	// Manually hides a modal. Returns to the caller before the modal
	// has actually been hidden (i.e. before the hidden.bs.modal event occurs).
	// Then destroys the element's modal.
	modalClose(modalId) {
		$(modalId).modal('hide');
		$(modalId).modal('dispose');
	},

	// This event fires immediately when the show instance method is called.
	// If caused by a click, the clicked element is available as the relatedTarget
	// property of the event.
	modalOnShow(modalId, callback) {
		$(modalId).one('show.bs.modal', function(e) {
			callback(e);
		});
	},

	// This event is fired when the modal has been made visible to the user
	// (will wait for CSS transitions to complete). If caused by a click,
	// the clicked element is available as the relatedTarget property of the event.
	modalOnShown(modalId, callback) {
		$(modalId).one('shown.bs.modal', function(e) {
			callback(e);
		});
	},

	// This event is fired immediately when the hide instance method has been called.
	modalOnHide(modalId, callback) {
		$(modalId).one('hide.bs.modal', function(e) {
			callback(e);
		});
	},

	// This event is fired when the modal has finished being hidden from the user
	// (will wait for CSS transitions to complete).
	modalOnHidden(modalId, callback) {
		$(modalId).one('hidden.bs.modal', function(e) {
			callback(e);
		});
	}
});
