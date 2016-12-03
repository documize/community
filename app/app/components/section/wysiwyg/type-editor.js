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

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend({
	appMeta: service(),
	link: service(),
	pageBody: "",

	didReceiveAttrs() {
		this.set('pageBody', this.get('meta.rawBody'));
	},

	didInsertElement() {
		let maxHeight = $(document).height() - 450;

		let options = {
			selector: "#rich-text-editor",
			relative_urls: false,
			cache_suffix: "?v=443",
			browser_spellcheck: false,
			gecko_spellcheck: false,
			theme: "modern",
			statusbar: false,
			height: maxHeight,
			entity_encoding: "raw",
			paste_data_images: true,
			image_advtab: true,
			image_caption: true,
			media_live_embeds: true,
			fontsize_formats: "8px 10px 12px 14px 18px 24px 36px 40px 50px 60px",
			formats: {
				bold: {
					inline: 'b'
				},
				italic: {
					inline: 'i'
				}
			},
			extended_valid_elements: "b,i,b/strong,i/em",
			plugins: [
				'advlist autolink lists link image charmap print preview hr anchor pagebreak',
				'searchreplace wordcount visualblocks visualchars code codesample fullscreen',
				'insertdatetime media nonbreaking save table directionality',
				'template paste textcolor colorpicker textpattern imagetools'
			],
			menu: {},
			menubar: false,
			toolbar1: "bold italic underline strikethrough superscript subscript | outdent indent bullist numlist forecolor backcolor | alignleft aligncenter alignright alignjustify | link unlink | table image media codesample",
			toolbar2: "formatselect fontselect fontsizeselect",
			save_onsavecallback: function () {
				Mousetrap.trigger('ctrl+s');
			}
		};

		if (typeof tinymce === 'undefined') {
			let url = this.session.get('assetURL');
			let tinymceBaseURL = "//" + window.location.host + "/tinymce";

			// handle desktop app
			if (url === null) {
				url = '';
				tinymceBaseURL = "tinymce";
			}

			$.getScript(url + "tinymce/tinymce.min.js?v=443", function () {
				window.tinymce.dom.Event.domLoaded = true;
				tinymce.baseURL = tinymceBaseURL;
				tinymce.suffix = ".min";
				tinymce.init(options);
			});
		} else {
			tinymce.init(options);
		}
	},

	willDestroyElement() {
		tinymce.remove();
	},

	actions: {
		onInsertLink(link) {
			let userSelection = tinymce.activeEditor.selection.getContent();

			if (is.not.empty(userSelection)) {
				Ember.set(link, 'title', userSelection);
			}

			let linkHTML = this.get('link').buildLink(link);
			tinymce.activeEditor.insertContent(linkHTML);

			return true;
		},

		isDirty() {
			return is.not.undefined(tinymce) && is.not.undefined(tinymce.activeEditor) && tinymce.activeEditor.isDirty();
		},

		onCancel() {
			this.attrs.onCancel();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');

			page.set('title', title);
			meta.set('rawBody', tinymce.activeEditor.getContent());

			this.attrs.onAction(page, meta);
		}
	}
});
