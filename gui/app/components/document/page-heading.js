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
import { computed } from '@ember/object';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(ModalMixin, {
	documentService: service('document'),
	searchService: service('search'),
	router: service(),
	deleteChildren: false,
	blockTitle: "",
	blockExcerpt: "",
	canEdit: false,
	canDelete: false,
	canMove: false,
	docSearchFilter: '',
	onKeywordChange: function () {
		debounce(this, this.searchDocs, 750);
	}.observes('docSearchFilter'),
	emptySearch: computed('docSearchResults', function() {
		return this.get('docSearchResults.length') === 0;
	}),
	hasMenuPermissions: computed('permissions', 'userPendingItem', 'canEdit', 'canMove', 'canDelete', function() {
		let permissions = this.get('permissions');

		return permissions.get('documentCopy') || permissions.get('documentTemplate') ||
			this.get('canEdit') || this.get('canMove') || this.get('canDelete');
	}),

	init() {
		this._super(...arguments);
		this.docSearchResults = [];
	},

	didReceiveAttrs() {
		this._super(...arguments);
		this.modalInputFocus('#publish-page-modal-' + this.get('page.id'), '#block-title-' + this.get('page.id'));

	},
	
	searchDocs() {
		let payload = { keywords: this.get('docSearchFilter').trim(), doc: true };
		if (payload.keywords.length == 0) return;

		this.get('searchService').find(payload).then((response)=> {
			this.set('docSearchResults', response);
		});
	},

	actions: {
		onEdit() {
			let page = this.get('page');

			if (page.get('pageType') == this.get('constants').PageType.Tab) {
				this.get('router').transitionTo('document.section', page.get('id'));
			} else {
				let cb = this.get('onEdit');
				cb();
			}
		},

		onDeletePage() {
			let cb = this.get('onDeletePage');
			cb(this.get('deleteChildren'));

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

				let cb = this.get('onSavePageAsBlock');
				cb(block);

				this.set('blockTitle', '');
				this.set('blockExcerpt', '');
				$(titleElem).removeClass('is-invalid');
				$(excerptElem).removeClass('is-invalid');

				this.modalClose('#publish-page-modal-' + this.get('page.id'));

				let refresh = this.get('refresh');
				refresh();
			});
		},

		onSelectSearchResult(documentId) {
			let results = this.get('docSearchResults');
			results.forEach((d) => {
				d.set('selected', d.get('documentId') === documentId);
			});
			this.set('docSearchResults', results);
		},

		onCopyPage() {
			let item = this.get('docSearchResults').findBy('selected', true);
			let documentId = is.not.undefined(item) ? item.get('documentId') : '';

			if (is.empty(documentId)) return;

			this.modalClose('#copy-page-modal-' + this.get('page.id'));

			let cb = this.get('onCopyPage');
			cb(documentId);

			let refresh = this.get('refresh');
			refresh();
		},

		onMovePage() {
			let item = this.get('docSearchResults').findBy('selected', true);
			let documentId = is.not.undefined(item) ? item.get('documentId') : '';

			if (is.empty(documentId)) return;

			// can't move into self
			if (documentId === this.get('document.id')) return;

			this.modalClose('#move-page-modal-' + this.get('page.id'));

			let cb = this.get('onMovePage');
			cb(documentId);

			let refresh = this.get('refresh');
			refresh();
		},
	}
});
