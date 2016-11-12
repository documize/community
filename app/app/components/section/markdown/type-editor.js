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
	editMode: true,
	isDirty: false,
	pageBody: "",
	pagePreview: "",
	height: $(document).height() - 450,

	didReceiveAttrs() {
		this.set("pageBody", this.get("meta.rawBody"));
	},

	didInsertElement() {
		$("#section-markdown-editor").css("height", this.get('height'));
		$("#section-markdown-preview").css("height", this.get('height'));

		$("#section-markdown-editor").off("keyup").on("keyup", () => {
			this.set('isDirty', true);
		});
	},

	willDestroyElement() {
		$("#section-markdown-editor").off("keyup");
	},

	actions: {
		toggleMode() {
			this.set('editMode', !this.get('editMode'));

			Ember.run.schedule('afterRender', () => {
				if (this.get('editMode')) {
					$("#section-markdown-editor").off("keyup").on("keyup", () => {
						this.set('isDirty', true);
					});
					$("#section-markdown-editor").css("height", this.get('height'));
				} else {
					let md = window.markdownit({ linkify: true });
					let result = md.render(this.get("pageBody"));

					this.set('pagePreview', result);
					$("#section-markdown-preview").css("height", this.get('height'));
				}
			});
		},

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
