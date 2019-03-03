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

import { computed } from '@ember/object';
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import tocUtil from '../../utils/toc';
import Component from '@ember/component';

export default Component.extend({
	classNames: ["section"],
	documentService: service('document'),
	emptyState: computed('pages', function () {
		return this.get('pages.length') === 0;
	}),
	canEdit: computed('permissions', 'document', 'pages', function() {
		let constants = this.get('constants');
		let permissions = this.get('permissions');
		let authenticated = this.get('session.authenticated');
		let notEmpty = this.get('pages.length') > 0;

		if (notEmpty && authenticated && permissions.get('documentEdit') && this.get('document.protection') === constants.ProtectionType.None) return true;
		if (notEmpty && authenticated && permissions.get('documentApprove') && this.get('document.protection') === constants.ProtectionType.Review) return true;

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
		let cp = this.get('currentPageId');
		this.setState(_.isEmpty(cp) ? '' : cp);
	},

	didInsertElement() {
		this._super(...arguments);
		this.eventBus.subscribe('documentPageAdded', this, 'onDocumentPageAdded');
	},

	willDestroyElement() {
		this._super(...arguments);
		this.eventBus.unsubscribe('documentPageAdded', this, 'onDocumentPageAdded');
	},

	onDocumentPageAdded(pageId) {
		schedule('afterRender', () => {
			this.setState(pageId);
		});
	},

	// Controls what user can do with the toc (left sidebar)
	setState(pageId) {
		let toc = this.get('pages');
		let page = _.find(toc, function(i) { return i.get('page.id') === pageId; });
		let state = tocUtil.getState(toc, !_.isUndefined(page) ? page.get('page') : page);

		if (!this.get('canEdit')) {
			state.actionablePage = false;
			state.upDisabled = state.downDisabled = state.indentDisabled = state.outdentDisabled = true;
		}

		this.set('state', state);
	},

	actions: {
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

		onGotoPage(id) {
			if (id === '')  return;
			this.setState(id);

			let cb = this.get('onShowPage');
			cb(id);
		}
	}
});
