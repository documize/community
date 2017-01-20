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
	computed
} = Ember;

export default Ember.Component.extend(TooltipMixin, {
	deleteChildren: false,
	menuOpen: false,
	saveAsTitle: "",


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
	saveAsTitleId: computed('page', function () {
		let id = this.get('page.id');
		return `save-as-title-${id}`;
	}),

	didRender() {
		if (this.get('isEditor')) {
			let self = this;
			$(".page-action-button").each(function (i, el) {
				self.addTooltip(el);
			});
		}

		$("#" + this.get('saveAsTitleId')).removeClass('error');
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

		saveAsPage(id) {
			let titleElem = '#' + this.get('saveAsTitleId');
			let saveAsTitle = this.get('saveAsTitle');
			if (is.empty(saveAsTitle)) {
				$(titleElem).addClass('error');
				return;
			}

			this.attrs.onSaveAsPage(id, saveAsTitle);
			this.set('menuOpen', false);
			this.set('saveAsTitle', '');
			$(titleElem).removeClass('error');

			return true;
		},
	}
});
