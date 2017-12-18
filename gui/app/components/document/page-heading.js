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
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from "@ember/array"
import ModalMixin from '../../mixins/modal';

export default Component.extend(ModalMixin, {
	documentService: service('document'),
	deleteChildren: false,
	blockTitle: "",
	blockExcerpt: "",
	documentList: A([]), 		//includes the current document
	documentListOthers: A([]), 	//excludes the current document
	hasMenuPermissions: computed('permissions', function() {
		let permissions = this.get('permissions');
		return permissions.get('documentDelete') || permissions.get('documentCopy') ||
			permissions.get('documentMove') || permissions.get('documentTemplate');
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		// Fetch document targets once
		if (this.get('documentList').length > 0) {
			return;
		}

		this.modalInputFocus('#publish-page-modal-' + this.get('page.id'), '#block-title-' + this.get('page.id'));
		this.load();
	},

	load() {
		this.get('documentService').getPageMoveCopyTargets().then((d) => {
			let me = this.get('document');

			d.forEach((i) => {
				i.set('selected', false);
			});

			if (this.get('isDestroyed') || this.get('isDestroying')) {
				return;
			}

			this.set('documentList', A(d));
			this.set('documentListOthers', A(d.filter((item) => item.get('id') !== me.get('id'))));
		});
	},

	actions: {
		onEdit() {
			this.attrs.onEdit();
		},

		onDeletePage() {
			this.attrs.onDeletePage(this.get('deleteChildren'));

			this.load();

			this.modalClose('#delete-page-modal-' + this.get('page.id'));
		},

		onSavePageAsBlock() {
			let page = this.get('page');
			let titleElem = '#block-title-' + page.get('id');
			let blockTitle = this.get('blockTitle');
			if (is.empty(blockTitle)) {
				$(titleElem).addClass('is-invalid');
				return;
			}

			let excerptElem = '#block-desc-' + page.get('id');
			let blockExcerpt = this.get('blockExcerpt');
			blockExcerpt = blockExcerpt.replace(/\n/g, "");
			if (is.empty(blockExcerpt)) {
				$(excerptElem).addClass('is-invalid');
				return;
			}

			this.get('documentService').getPageMeta(this.get('document.id'), page.get('id')).then((pm) => {
				let block = {
					folderId: this.get('folder.id'),
					contentType: page.get('contentType'),
					pageType: page.get('pageType'),
					title: blockTitle,
					body: page.get('body'),
					excerpt: blockExcerpt,
					rawBody: pm.get('rawBody'),
					config: pm.get('config'),
					externalSource: pm.get('externalSource')
				};

				this.attrs.onSavePageAsBlock(block);

				this.set('menuOpen', false);
				this.set('blockTitle', '');
				this.set('blockExcerpt', '');
				$(titleElem).removeClass('is-invalid');
				$(excerptElem).removeClass('is-invalid');

				this.load();

				this.modalClose('#publish-page-modal-' + this.get('page.id'));
			});
		},

		onCopyPage() {
			// can't proceed if no data
			if (this.get('documentList.length') === 0) {
				return;
			}

			let targetDocumentId = this.get('documentList').findBy('selected', true).get('id');

			// fall back to self
			if (is.null(targetDocumentId)) {
				targetDocumentId = this.get('document.id');
			}

			this.attrs.onCopyPage(targetDocumentId);

			this.load();

			this.modalClose('#copy-page-modal-' + this.get('page.id'));
		},

		onMovePage() {
			// can't proceed if no data
			if (this.get('documentListOthers.length') === 0) {
				return;
			}

			let targetDocumentId = this.get('documentListOthers').findBy('selected', true).get('id');

			// fall back to first document
			if (is.null(targetDocumentId)) {
				targetDocumentId = this.get('documentListOthers')[0].get('id');
			}

			this.attrs.onMovePage(targetDocumentId);

			this.load();

			this.modalClose('#move-page-modal-' + this.get('page.id'));
		}
	}
});
