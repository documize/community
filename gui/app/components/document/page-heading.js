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
import { computed, observer } from '@ember/object';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import ModalMixin from '../../mixins/modal';
import tocUtil from '../../utils/toc';
import Component from '@ember/component';

export default Component.extend(Notifier, ModalMixin, {
	documentService: service('document'),
	searchService: service('search'),
	router: service(),
	appMeta: service(),
	i18n: service(),
	deleteChildren: false,
	blockTitle: "",
	blockExcerpt: "",
	targetSpace: null,
	targetDocs: null,
	targetDoc: null,

	// eslint-disable-next-line ember/no-observers
	onKeywordChange: observer('docSearchFilter',  function() {
		debounce(this, this.searchDocs, 750);
	}),

	emptySearch: computed('docSearchResults', function() {
		return this.get('docSearchResults.length') === 0;
	}),
	canEdit: computed('permissions', 'document', 'pages', function() {
		let constants = this.get('constants');
		let permissions = this.get('permissions');
		let authenticated = this.get('session.authenticated');
		let notEmpty = this.get('pages.length') > 0;

		if (notEmpty && authenticated && permissions.get('documentEdit')
			&& (this.get('document.protection') !== constants.ProtectionType.Lock)) {
				return true;
		}

		// if (notEmpty && authenticated && permissions.get('documentEdit') && this.get('document.protection') === constants.ProtectionType.None) return true;
		// if (notEmpty && authenticated && permissions.get('documentApprove') && this.get('document.protection') === constants.ProtectionType.Review) return true;

		return false;
	}),

	init() {
		this._super(...arguments);

		this.state = {
			actionablePage: false,
			upDisabled: true,
			downDisabled: true,
			indentDisabled: true,
			outdentDisabled: true,
			pageId: ''
		};
	},

	didReceiveAttrs() {
		this._super(...arguments);
		this.modalInputFocus('#publish-page-modal-' + this.get('page.id'), '#block-title-' + this.get('page.id'));

		this.setState(this.get('page.id'));
	},

	didInsertElement(){
		this._super(...arguments);

		let pageId = this.get('page.id');
		let url = window.location.protocol + '//' + this.get('appMeta.appHost') + this.get('router').generate('document.index', {queryParams: {currentPageId: pageId}});
		let self = this;

		let clip = new ClipboardJS('#page-copy-link-' + pageId, {
			text: function() {
				self.notifySuccess(self.i18n.localize('copied'));
				return url;
			}
		});

		this.set('clip', clip);
	},

	willDestroyElement() {
		this._super(...arguments);

		let clip = this.get('clip');
		if (!_.isUndefined(clip)) clip.destroy();
	},

	// Controls what user can do with the toc enty for this page
	setState(pageId) {
		let toc = this.get('pages');
		let page = _.find(toc, function(i) { return i.get('page.id') === pageId; });
		let state = tocUtil.getState(toc, page.get('page'));

		if (!this.get('canEdit')) {
			state.actionablePage = false;
			state.upDisabled = state.downDisabled = state.indentDisabled = state.outdentDisabled = true;
		}

		this.set('state', state);
	},

	actions: {
		onShowSectionWizard(beforePage) {
			this.get('onShowSectionWizard')(beforePage);
		},

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

		onShowPublishModal() {
			this.modalOpen('#publish-page-modal-' + this.get('page.id'), {"show": true}, '#block-title-' + this.get('page.id'));
		},

		onSavePageAsBlock() {
			let page = this.get('page');
			let titleElem = '#block-title-' + page.get('id');
			let blockTitle = this.get('blockTitle');
			if (_.isEmpty(blockTitle)) {
				$(titleElem).addClass('is-invalid');
				return;
			}

			let excerptElem = '#block-desc-' + page.get('id');
			let blockExcerpt = this.get('blockExcerpt');
			blockExcerpt = blockExcerpt.replace(/\n/g, "");
			if (_.isEmpty(blockExcerpt)) {
				$(excerptElem).addClass('is-invalid');
				return;
			}

			this.get('documentService').getPageMeta(this.get('document.id'), page.get('id')).then((pm) => {
				let block = {
					spaceId: this.get('folder.id'),
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

		onShowCopyModal() {
			this.send('onSelectSpace', this.get('folder'));
			this.modalOpen('#copy-page-modal-' + this.get('page.id'), {show:true});
		},

		onShowMoveModal() {
			this.send('onSelectSpace', this.get('folder'));
			this.modalOpen('#move-page-modal-' + this.get('page.id'), {show:true});
		},

		onCopyPage() {
			let targetDoc = this.get('targetDoc');
			if (_.isNull(targetDoc)) return;

			this.modalClose('#copy-page-modal-' + this.get('page.id'));

			this.get('onCopyPage')(targetDoc.get('id'));
			this.get('refresh')();
		},

		onMovePage() {
			let targetDoc = this.get('targetDoc');
			if (_.isNull(targetDoc)) return;

			this.modalClose('#move-page-modal-' + this.get('page.id'));

			this.get('onMovePage')(targetDoc.get('id'));
			this.get('refresh')();
		},

		// Load up documents for selected space and select the first one.
		onSelectSpace(space) {
			this.set('targetSpace', space);

			this.get('documentService').getAllBySpace(space.get('id')).then((docs) => {
				this.set('targetDocs', docs);

				if (space.get('id') === this.get('folder.id')) {
					this.set('targetDoc', this.get('document'));
				} else {
					if (docs.length > 0) {
						this.set('targetDoc', docs[0]);
					}
				}
			});
		},

		onSelectDoc(doc) {
			this.set('targetDoc', doc);
		},

		// Page up -- above pages shunt down
		pageUp() {
			let state = this.get('state');

			if (state.upDisabled || this.get('document.protection') !== this.get('constants').ProtectionType.None) {
				return;
			}

			let pages = this.get('pages');
			let page = _.find(pages, function(i) { return i.get('page.id') === state.pageId; });
			if (!_.isUndefined(page)) page = page.get('page');

			let pendingChanges = tocUtil.moveUp(state, pages, page);
			if (pendingChanges.length > 0) {
				let cb = this.get('onPageSequenceChange');
				cb(state.pageId, pendingChanges);
			}
		},

		// Move down -- pages below shift up
		pageDown() {
			if (!this.get('canEdit')) return;

			let state = this.get('state');
			let pages = this.get('pages');
			let page = _.find(pages, function(i) { return i.get('page.id') === state.pageId; });
			if (!_.isUndefined(page)) page = page.get('page');

			let pendingChanges = tocUtil.moveDown(state, pages, page);
			if (pendingChanges.length > 0) {
				let cb = this.get('onPageSequenceChange');
				cb(state.pageId, pendingChanges);
			}
		},

		// Indent -- changes a page from H2 to H3, etc.
		pageIndent() {
			if (!this.get('canEdit')) return;

			let state = this.get('state');
			let pages = this.get('pages');
			let page = _.find(pages, function(i) { return i.get('page.id') === state.pageId; });
			if (!_.isUndefined(page)) page = page.get('page');

			let pendingChanges = tocUtil.indent(state, pages, page);
			if (pendingChanges.length > 0) {
				let cb = this.get('onPageLevelChange');
				cb(state.pageId, pendingChanges);
			}
		},

		// Outdent -- changes a page from H3 to H2, etc.
		pageOutdent() {
			if (!this.get('canEdit')) return;

			let state = this.get('state');
			let pages = this.get('pages');
			let page = _.find(pages, function(i) { return i.get('page.id') === state.pageId; });
			if (!_.isUndefined(page)) page = page.get('page');

			let pendingChanges = tocUtil.outdent(state, pages, page);
			if (pendingChanges.length > 0) {
				let cb = this.get('onPageLevelChange');
				cb(state.pageId, pendingChanges);
			}
		},

		onExpand() {
			this.set('expanded', !this.get('expanded'));
			this.get('onExpand')(this.get('page.id'), this.get('expanded'));
		},

		onCopyLink() {
			this.set('currentPageId', this.get('page.id'));
		}
	}
});
