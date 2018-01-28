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
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import tocUtil from '../../utils/toc';
import TooltipMixin from '../../mixins/tooltip';

export default Component.extend(TooltipMixin, {
	documentService: service('document'),
	isDesktop: false,
	emptyState: computed('pages', function () {
		return this.get('pages.length') === 0;
	}),
	canEdit: computed('permssions', 'document', function() {
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
		this.setState(is.empty(cp) ? '' : cp);
	},

	didInsertElement() {
		this._super(...arguments);
		this.eventBus.subscribe('documentPageAdded', this, 'onDocumentPageAdded');
		this.eventBus.subscribe('resized', this, 'setSize');
	
		this.setSize();
		this.renderTooltips();
	},

	willDestroyElement() {
		this._super(...arguments);
		this.eventBus.unsubscribe('documentPageAdded');
		this.eventBus.unsubscribe('resized');

		let t = '#doc-toc';
		if (interact.isSet(t)) interact(t).unset();
		this.removeTooltips();
	},

	onDocumentPageAdded(pageId) { // eslint-disable-line no-unused-vars
		this.setSize();
	},

	setSize() {
		schedule('afterRender', () => {
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

					$("#doc-toc").css({
						'display': 'inline-block',
						'position': 'fixed',
						'width': l+'px',
						'height': 'auto',
						'transform': '',
					});

					this.attachResizer();
				}
			} else {
				$("#doc-toc").css({
					'display': 'block',
					'position': 'relative',
					'width': '100%',
					'height': '500px',
					'transform': 'none',
				});
			}
		});
	},

	attachResizer() {
		schedule('afterRender', () => {
			let t = '#doc-toc';
			if (interact.isSet(t)) {
				interact(t).unset();
			}

			interact('#doc-toc')
				.draggable({
					autoScroll: true,
					inertia: false,
					onmove: dragMoveListener,
					// restrict: {
					// 	restriction: "body",
					// 	endOnly: true,
					// 	elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
					// }
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
					// restrictSize: {
					// 	min: { width: 250, height: 65 },
					// }
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
	},

	// Controls what user can do with the toc (left sidebar)
	setState(pageId) {
		let toc = this.get('pages');
		let page = _.find(toc, function(i) { return i.get('page.id') === pageId; });
		let state = tocUtil.getState(toc, is.not.undefined(page) ? page.get('page') : page);

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
			if (is.not.undefined(page)) page = page.get('page');

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
			if (is.not.undefined(page)) page = page.get('page');

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
			if (is.not.undefined(page)) page = page.get('page');

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
			if (is.not.undefined(page)) page = page.get('page');

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
