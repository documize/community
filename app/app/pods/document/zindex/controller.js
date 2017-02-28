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
	sectionService: Ember.inject.service('section'),
	queryParams: ['page'],

	// Jump to the right part of the document.
	scrollToPage(pageId) {
		Ember.run.schedule('afterRender', function () {
			let dest;
			let target = "#page-title-" + pageId;
			let targetOffset = $(target).offset();

			if (is.undefined(targetOffset)) {
				return;
			}

			dest = targetOffset.top > $(document).height() - $(window).height() ? $(document).height() - $(window).height() : targetOffset.top;
			// small correction to ensure we also show page title
			dest = dest > 50 ? dest - 74 : dest;

			$("html,body").animate({
				scrollTop: dest
			}, 500, "linear");
			$(".toc-index-item").removeClass("selected");
			$("#index-" + pageId).addClass("selected");
		});
	},

	actions: {
		gotoPage(pageId) {
			if (is.null(pageId)) {
				return;
			}

			this.scrollToPage(pageId);
		},

		onPageSequenceChange(changes) {
			this.get('documentService').changePageSequence(this.get('model.document.id'), changes).then(() => {
				_.each(changes, (change) => {
					let pageContent = _.findWhere(this.get('model.pages'), {
						id: change.pageId
					});

					if (is.not.undefined(pageContent)) {
						pageContent.set('sequence', change.sequence);
					}
				});

				this.set('model.pages', this.get('model.pages').sortBy('sequence'));
				this.get('target.router').refresh();
			});
		},

		onPageLevelChange(changes) {
			this.get('documentService').changePageLevel(this.get('model.document.id'), changes).then(() => {
				_.each(changes, (change) => {
					let pageContent = _.findWhere(this.get('model.pages'), {
						id: change.pageId
					});

					if (is.not.undefined(pageContent)) {
						pageContent.set('level', change.level);
					}
				});

				let pages = this.get('model.pages');
				pages = pages.sortBy('sequence');
				this.set('model.pages', pages);

				this.get('target.router').refresh();
			});
		},


	}
});
