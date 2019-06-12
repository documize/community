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
	router: service(),
	documentService: service('document'),

	actions: {
		onCancel() {
			this.transitionToRoute('document.index',
				this.get('model.folder.id'),
				this.get('model.folder.slug'),
				this.get('model.document.id'),
				this.get('model.document.slug'),
				{ queryParams: { pageId: this.get('model.page.id') }});
		},

		onAction(page, meta) {
			let model = {
				page: page.toJSON({ includeId: true }),
				meta: meta.toJSON({ includeId: true })
			};

			this.get('documentService').updatePage(page.get('documentId'), page.get('id'), model).then((page) => {
				let data = this.get('store').normalize('page', page);
				this.get('store').push(data);

				this.transitionToRoute('document.index',
					this.get('model.folder.id'),
					this.get('model.folder.slug'),
					this.get('model.document.id'),
					this.get('model.document.slug'),
					{ queryParams: { currentPageId: page.get('id')}});
			});
		},

		onAttachmentUpload() {
			this.get('documentService').getAttachments(this.get('model.document.id')).then((files) => {
				this.set('model.attachments', files);
			});
		},

		onAttachmentDelete(attachmentId) {
			this.get('documentService').deleteAttachment(this.get('model.document.id'), attachmentId).then(() => {
				this.get('documentService').getAttachments(this.get('model.document.id')).then((files) => {
					this.set('attachments', files);
				});
			});
		},
	}
});
