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

import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	documentService: Ember.inject.service('document'),

	getAttachments() {
		let self = this;
		this.get('documentService').getAttachments(this.get('model.document.id')).then(function (files) {
			self.set('model.files', files);
		});
	},

	actions: {
		onUpload() {
			this.getAttachments();
		},

		onDelete(id, name) {
			let self = this;

			this.showNotification(`Deleted ${name}`);

			this.get('documentService').deleteAttachment(this.get('model.document.id'), id).then(function () {
				self.getAttachments();
			});
		},
	}
});
