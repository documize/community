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
import TooltipMixin from '../../mixins/tooltip';

const {
	computed,
	inject: { service }
} = Ember;

export default Ember.Component.extend(TooltipMixin, {
	documentService: service('document'),
	deleteChildren: false,
	menuOpen: false,
	blockTitle: "",
	blockExcerpt: "",

	checkId: computed('page', function () {
		let id = this.get('page.id');
		return `delete-check-button-${id}`;
	}),
	menuTarget: computed('page', function () {
		let id = this.get('page.id');
		return `page-menu-${id}`;
	}),
	deleteButtonId: computed('page', function () {
		let id = this.get('page.id');
		return `delete-page-button-${id}`;
	}),
	saveAsTarget: computed('page', function () {
		let id = this.get('page.id');
		return `saveas-page-button-${id}`;
	}),
	saveAsDialogId: computed('page', function () {
		let id = this.get('page.id');
		return `save-as-dialog-${id}`;
	}),
	blockTitleId: computed('page', function () {
		let id = this.get('page.id');
		return `block-title-${id}`;
	}),
	blockExcerptId: computed('page', function () {
		let id = this.get('page.id');
		return `block-excerpt-${id}`;
	}),

	didRender() {
		if (this.get('isEditor')) {
			let self = this;
			$(".page-action-button").each(function (i, el) {
				self.addTooltip(el);
			});
		}

		$("#" + this.get('blockTitleId')).removeClass('error');
		$("#" + this.get('blockExcerptId')).removeClass('error');
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	actions: {
		onMenuOpen() {
			if ($('#' + this.get('saveAsDialogId')).is( ":visible" )) {
				return;
			}

			this.set('menuOpen', !this.get('menuOpen'));
		},

		editPage(id) {
			this.attrs.onEditPage(id);
		},

		deletePage(id) {
			this.attrs.onDeletePage(id, this.get('deleteChildren'));
		},

		onAddBlock(page) {
			let titleElem = '#' + this.get('blockTitleId');
			let blockTitle = this.get('blockTitle');
			if (is.empty(blockTitle)) {
				$(titleElem).addClass('error');
				return;
			}

			let excerptElem = '#' + this.get('blockExcerptId');
			let blockExcerpt = this.get('blockExcerpt');
			blockExcerpt = blockExcerpt.replace(/\n/g, "");
			if (is.empty(blockExcerpt)) {
				$(excerptElem).addClass('error');
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

				this.attrs.onAddBlock(block);
				this.set('menuOpen', false);
				this.set('blockTitle', '');
				this.set('blockExcerpt', '');
				$(titleElem).removeClass('error');
				$(excerptElem).removeClass('error');

				return true;
			});
		},
	}
});
