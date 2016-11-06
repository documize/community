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
import NotifierMixin from '../../mixins/notifier';

export default Ember.Component.extend(TooltipMixin, NotifierMixin, {
    documentService: Ember.inject.service('document'),
    document: {},
    folder: {},
	showToc: true,
	showViews: false,
	showContributions: false,
	showSections: false,
	showScrollTool: false,
	showingSections: false,

	didRender() {
		if (this.session.authenticated) {
            this.addTooltip(document.getElementById("owner-avatar"));
			this.addTooltip(document.getElementById("section-tool"));
        }
	},

	didInsertElement() {
        this.eventBus.subscribe('resized', this, 'positionTool');
		this.eventBus.subscribe('scrolled', this, 'positionTool');
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	positionTool() {
		if (this.get('isDestroyed') || this.get('isDestroying')) {
			return;
		}

		let s = $(".scroll-tool");
		let windowpos = $(window).scrollTop();

		if (windowpos >= 300) {
			this.set('showScrollTool', true);
			s.addClass("stuck-tool");
			s.css('left', parseInt($(".zone-navigation").css('width')) + parseInt($(".zone-sidebar").css('width')) - 18 + 'px');
		} else {
			this.set('showScrollTool', false);
			s.removeClass("stuck-tool");
		}
	},

    actions: {
        // Page up - above pages shunt down.
        onPageSequenceChange(pendingChanges) {
            this.attrs.changePageSequence(pendingChanges);
        },

        // Move down - pages below shift up.
        onPageLevelChange(pendingChanges) {
            this.attrs.changePageLevel(pendingChanges);
        },

        gotoPage(id) {
            return this.attrs.gotoPage(id);
        },

		showToc() {
			this.set('showToc', true);
			this.set('showViews', false);
			this.set('showContributions', false);
			this.set('showSections', false);
			this.set('showingSections', false);
		},

		showViews() {
			this.set('showToc', false);
			this.set('showViews', true);
			this.set('showContributions', false);
			this.set('showSections', false);
			this.set('showingSections', false);
		},

		showContributions() {
			this.set('showToc', false);
			this.set('showViews', false);
			this.set('showContributions', true);
			this.set('showSections', false);
			this.set('showingSections', false);
		},

		showSections() {
			this.set('showToc', false);
			this.set('showViews', false);
			this.set('showContributions', false);
			this.set('showSections', true);
			this.set('showingSections', true);
		},

		onCancel() {
			this.send('showToc');
			this.set('showingSections', false);
		},

		onAddSection(section) {
			this.attrs.onAddSection(section);

			this.set('showingSections', false);
		},

		scrollTop() {
			this.set('showScrollTool', false);

			$("html,body").animate({
				scrollTop: 0
			}, 500, "linear");
		}
    }
});
