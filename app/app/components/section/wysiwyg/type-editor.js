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
	appMeta: Ember.inject.service(),
	link: service(),
	pageBody: "",
	drop: null,
	showSidebar: false,

	didReceiveAttrs() {
		this.set('pageBody', this.get('meta.rawBody'));
	},

	didInsertElement() {
		let self = this;

		let options = {
			selector: "#rich-text-editor",
			relative_urls: false,
			cache_suffix: "?v=430",
			browser_spellcheck: false,
			gecko_spellcheck: false,
			theme: "modern",
			statusbar: false,
			height: $(document).height() - $(".document-editor > .toolbar").height() - 200,
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
			toolbar1: "bold italic underline strikethrough superscript subscript | outdent indent bullist numlist forecolor backcolor | alignleft aligncenter alignright alignjustify | link unlink | table image media | hr codesample",
			toolbar2: "formatselect fontselect fontsizeselect | documizeLinkButton",
			save_onsavecallback: function () {
				Mousetrap.trigger('ctrl+s');
			},
			setup: function (editor) {
				editor.addButton('documizeLinkButton', {
					title: 'Insert Link',
					icon: false,
					image: '/favicon.ico',
					onclick: function () {
						let showSidebar = !self.get('showSidebar');
						self.set('showSidebar', showSidebar);

						if (showSidebar) {
							self.send('showSidebar');
						}
					}
				});
			}
		};

		if (typeof tinymce === 'undefined') {
			$.getScript("/tinymce/tinymce.min.js?v=443", function () {
				window.tinymce.dom.Event.domLoaded = true;
				tinymce.baseURL = "//" + window.location.host + "/tinymce";
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
		showSidebar() {
			this.set('linkName', tinymce.activeEditor.selection.getContent());
		},

		onInsertLink(link) {
			let linkHTML = this.get('link').buildLink(link);
			tinymce.activeEditor.insertContent(linkHTML);
			this.set('showSidebar', false);
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

// editor.insertContent('&nbsp;<b>It\'s my button!</b>&nbsp;');
// Selects the first paragraph found
// tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
