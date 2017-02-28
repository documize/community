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
import miscUtil from '../../../utils/misc';
import TooltipMixin from '../../../mixins/tooltip';

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(TooltipMixin, {
	link: service(),
	editMode: true,
	isDirty: false,
	pageBody: "",
	pagePreview: "",
	editorId: Ember.computed('page', function () {
		let page = this.get('page');
		return `markdown-editor-${page.id}`;
	}),
	previewId: Ember.computed('page', function () {
		let page = this.get('page');
		return `markdown-preview-${page.id}`;
	}),
	tooltipId: Ember.computed('page', function () {
		let page = this.get('page');
		return `markdown-tooltip-${page.id}`;
	}),

	didReceiveAttrs() {
		this.set("pageBody", this.get("meta.rawBody"));
	},

	didInsertElement() {
		$("#" + this.get('editorId')).off("keyup").on("keyup", () => {
			this.set('isDirty', true);
		});
	},

	didRender() {
		this.addTooltip(document.getElementById(this.get('tooltipId')));
	},

	willDestroyElement() {
		this.destroyTooltips();
		$("#" + this.get('editorId')).off("keyup");
	},

	actions: {
		toggleMode() {
			this.set('editMode', !this.get('editMode'));

			Ember.run.schedule('afterRender', () => {
				if (this.get('editMode')) {
					$("#" + this.get('editorId')).off("keyup").on("keyup", () => {
						this.set('isDirty', true);
					});
				} else {
					let md = window.markdownit({ linkify: true });
					let result = md.render(this.get("pageBody"));

					this.set('pagePreview', result);
				}
			});
		},

		onInsertLink(link) {
			let linkMarkdown = this.get('link').buildLink(link);

			miscUtil.insertAtCursor($("#" + this.get('editorId'))[0], linkMarkdown);
			this.set('pageBody', $("#" + this.get('editorId')).val());

			return true;
		},

		isDirty() {
			return this.get('isDirty');
		},

		onCancel() {
			this.attrs.onCancel();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('rawBody', this.get("pageBody"));

			this.attrs.onAction(page, meta);
		}
	}
});
