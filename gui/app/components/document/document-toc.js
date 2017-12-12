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
import Component from '@ember/component';
import tocUtil from '../../utils/toc';
import NotifierMixin from '../../mixins/notifier';

export default Component.extend(NotifierMixin, {
	document: {},
	folder: {},
	pages: [],
	currentPageId: "",
	state: {
		actionablePage: false,
		upDisabled: true,
		downDisabled: true,
		indentDisabled: true,
		outdentDisabled: true
	},
	emptyState: computed('pages', function () {
		return this.get('pages.length') === 0;
	}),
	isDesktop: true,

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('showToc', is.not.undefined(this.get('pages')) && this.get('pages').get('length') > 0);

		if (is.not.null(this.get('currentPageId'))) {
			this.send('onEntryClick', this.get('currentPageId'));
		}
	},

	didInsertElement() {
		this._super(...arguments);

		this.setSize();

		this.eventBus.subscribe('documentPageAdded', this, 'onDocumentPageAdded');
		this.eventBus.subscribe('resized', this, 'onResize');
	},

	willDestroyElement() {
		this._super(...arguments);

		this.eventBus.unsubscribe('documentPageAdded');
		this.eventBus.unsubscribe('resized');
	},

	onDocumentPageAdded(pageId) {
		this.send('onEntryClick', pageId);
		this.setSize();
	},

	onResize() {
		this.setSize();
	},

	setSize() {
		this.set('isDesktop', $(window).width() >= 1800);

		let h = $(window).height() - $("#nav-bar").height() - 140;
		$("#doc-toc").css('max-height', h);

		let i = $("#doc-view").offset();

		if (is.not.undefined(i)) {
			let l = i.left - 100;
			if (l > 350) l = 350;
			$("#doc-toc").width(l);
		}
	},

	// Controls what user can do with the toc (left sidebar)
	// Identifies the target pages
	setState(pageId) {
		this.set('currentPageId', pageId);

		let toc = this.get('pages');
		let page = _.findWhere(toc, { id: pageId });
		let state = tocUtil.getState(toc, page);

		if (!this.get('permissions.documentEdit') || is.empty(pageId)) {
			state.actionablePage = false;
			state.upDisabled = state.downDisabled = state.indentDisabled = state.outdentDisabled = true;
		}

		this.set('state', state);
	},

	actions: {
		// Page up -- above pages shunt down
		pageUp() {
			if (this.get('state.upDisabled')) {
				return;
			}

			let state = this.get('state');
			let pages = this.get('pages');
			let page = _.findWhere(pages, { id: this.get('currentPageId') });
			let pendingChanges = tocUtil.moveUp(state, pages, page);

			if (pendingChanges.length > 0) {
				this.attrs.onPageSequenceChange(pendingChanges);

				this.send('onEntryClick', this.get('currentPageId'));
				this.showNotification("Moved up");
			}
		},

		// Move down -- pages below shift up
		pageDown() {
			if (this.get('state.downDisabled')) {
				return;
			}

			let state = this.get('state');
			var pages = this.get('pages');
			var page = _.findWhere(pages, { id: this.get('currentPageId') });
			let pendingChanges = tocUtil.moveDown(state, pages, page);

			if (pendingChanges.length > 0) {
				this.attrs.onPageSequenceChange(pendingChanges);

				this.send('onEntryClick', this.get('currentPageId'));
				this.showNotification("Moved down");
			}
		},

		// Indent -- changes a page from H2 to H3, etc.
		pageIndent() {
			if (this.get('state.indentDisabled')) {
				return;
			}

			let state = this.get('state');
			var pages = this.get('pages');
			var page = _.findWhere(pages, { id: this.get('currentPageId') });
			let pendingChanges = tocUtil.indent(state, pages, page);

			if (pendingChanges.length > 0) {
				this.attrs.onPageLevelChange(pendingChanges);

				this.showNotification("Indent");
				this.send('onEntryClick', this.get('currentPageId'));
			}
		},

		// Outdent -- changes a page from H3 to H2, etc.
		pageOutdent() {
			if (this.get('state.outdentDisabled')) {
				return;
			}

			let state = this.get('state');
			var pages = this.get('pages');
			var page = _.findWhere(pages, { id: this.get('currentPageId') });
			let pendingChanges = tocUtil.outdent(state, pages, page);

			if (pendingChanges.length > 0) {
				this.attrs.onPageLevelChange(pendingChanges);

				this.showNotification("Outdent");
				this.send('onEntryClick', this.get('currentPageId'));
			}
		},

		onEntryClick(id) {
			this.setState(id);
			this.attrs.onGotoPage(id);
		}
	}
});

/*
	Specs
	-----

	1. Must max max height to prevent off screen problems
	2. Must be usable on mobile and desktop
	3. Must be sticky and always visible (at least desktop)
	4. Must set width or leave to grid system

	Solution
	--------

	1. max-height calc on insert/repaint
	1. overflow: scroll

	2. on mobile/sm/md/lg we can put in little box to side of doc meta
	   and then set to fixed height based on screen size
	2. on xl we can put into sidebar

	3. sticky on xl desktop is fine as sidebar uses fixed position
	   and content has max-height with overflow
	3. sticky on col/sm/md/lg is not available

	Notes
	-----

	We could go with container-fluid and use full width of screen.
	This would work on all devices and take more space on 

	$(window).width() needs to be 1800 or more for sticky sidebar...
	$("#nav-bar").height()
	$(window).height() - $("#nav-bar").height() - 100

	Two choices:

	if width >= 1800 then sidebar sticky outside container
	if widht < 1800 then switch to container-fluid?
		...but what about height?
		...put next to doc--meta
*/
