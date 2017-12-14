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
import { schedule } from '@ember/runloop'
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import tocUtil from '../../utils/toc';
import NotifierMixin from '../../mixins/notifier';

export default Component.extend(NotifierMixin, {
	documentService: service('document'),
	document: {},
	folder: {},
	pages: [],
	currentPageId: '',
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
	isDesktop: false,

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('showToc', is.not.undefined(this.get('pages')) && this.get('pages').get('length') > 0);

		if (is.not.null(this.get('currentPageId'))) {
			this.send('onEntryClick', this.get('currentPageId'));
		}

		this.setState(this.get('currentPageId'));
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

		let t = '#doc-toc';
		if (interact.isSet(t)) {
			interact(t).unset();
		}
	},

	onDocumentPageAdded(pageId) {
		this.send('onEntryClick', pageId);
		this.setSize();
	},

	onResize() {
		this.setSize();
	},

	setSize() {
		let isDesktop = $(window).width() >= 1800;
		this.set('isDesktop', isDesktop);

		if (isDesktop) {
			let h = $(window).height() - $("#nav-bar").height() - 140;
			$("#doc-toc").css('max-height', h);
	
			let i = $("#doc-view").offset();
	
			if (is.not.undefined(i)) {
				let l = i.left - 100;
				if (l > 350) l = 350;
				$("#doc-toc").width(l);
			}
		}

		schedule('afterRender', () => {
			interact('#doc-toc')
				.draggable({
					autoScroll: true,
					onmove: dragMoveListener,
					// inertia: true,
					restrict: {
						// restriction: ".body",
						// endOnly: true,
						// elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
					}
				})
				.resizable({
					// resize from all edges and corners
					edges: { left: true, right: true, bottom: true, top: true },
					// keep the edges inside the parent
					// restrictEdges: {
					// 	outer: 'parent',
					// 	endOnly: true,
					// },
					// minimum size
					restrictSize: {
						min: { width: 250, height: 65 },
					}
				})
				.on('resizemove', function (event) {
					var target = event.target,
						x = (parseFloat(target.getAttribute('data-x')) || 0),
						y = (parseFloat(target.getAttribute('data-y')) || 0);

					// update the element's style
					target.style.width  = event.rect.width + 'px';
					target.style.height = event.rect.height + 'px';

					// translate when resizing from top or left edges
					x += event.deltaRect.left;
					y += event.deltaRect.top;

					target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

					target.setAttribute('data-x', x);
					target.setAttribute('data-y', y);
					target.style.position = 'fixed';
				});
		});

		function dragMoveListener (event) {
			var target = event.target,
			// keep the dragged position in the data-x/data-y attributes
			x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
			y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

			// translate the element
			target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

			// update the posiion attributes
			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);
			target.style.position = 'fixed';
		}

		// this is used later in the resizing and gesture demos
		window.dragMoveListener = dragMoveListener;
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
			}
		},

		onEntryClick(id) {
			if (id !== '') {
				let jumpTo = "#page-" + id;

				if (!$(jumpTo).inView()) {
					$(jumpTo).velocity("scroll", { duration: 250, offset: -100 });
				}
				this.setState(id);
			}
		}
	}
});
