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

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend({
	link: service(),

	isDirty: false,
	pageBody: "",

	didReceiveAttrs() {
		this.set("pageBody", this.get("meta.rawBody"));
	},

	didInsertElement() {
		let height = $(document).height() - $(".document-editor > .toolbar").height() - 130;
		$("#section-markdown-editor, #section-markdown-preview").css("height", height);

		this.renderPreview();
		let self = this;

		$("#section-markdown-editor").off("keyup").on("keyup", function () {
			self.renderPreview();
			self.set('isDirty', true);
		});
	},

	willDestroyElement() {
		$("#section-markdown-editor").off("keyup");
	},

	renderPreview() {
		let md = window.markdownit({
			linkify: true
		});
		let result = md.render(this.get("pageBody"));
		$("#section-markdown-preview").html(result);
	},

	actions: {
		onInsertLink(link) {
			let linkMarkdown = this.get('link').buildLink(link);

			miscUtil.insertAtCursor($("#section-markdown-editor")[0], linkMarkdown);
			this.set('pageBody', $("#section-markdown-editor").val());

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
