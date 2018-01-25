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
import { computed, set } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
	appMeta: service(),
	link: service(),
	pageBody: "",
	editorId: computed('page', function () {
		let page = this.get('page');
		return `wysiwyg-editor-${page.id}`;
	}),

	didReceiveAttrs() {
		this.set('pageBody', this.get('meta.rawBody'));
	},

	didInsertElement() {
		let options = {
			selector: "#" + this.get('editorId'),
			relative_urls: false,
			cache_suffix: "?v=475",
			browser_spellcheck: true,
			gecko_spellcheck: false,
			theme: "modern",
			skin: 'documize',
			statusbar: false,
			inline: true,
			entity_encoding: "raw",
			paste_data_images: true,
			image_advtab: true,
			image_caption: true,
			media_live_embeds: true,
			fontsize_formats: "8px 10px 12px 14px 17px 18px 24px 36px 40px 50px 60px",
			formats: {
				bold: {
					inline: 'b'
				},
				italic: {
					inline: 'i'
				}
			},
			codesample_languages: [
				{text: 'HTML/XML', value: 'markup'},
				{text: 'JavaScript', value: 'javascript'},
				{text: 'CSS', value: 'css'},
				{text: 'PHP', value: 'php'},
				{text: 'Ruby', value: 'ruby'},
				{text: 'Python', value: 'python'},
				{text: 'Java', value: 'java'},
				{text: 'C', value: 'c'},
				{text: 'C#', value: 'csharp'},
				{text: 'C++', value: 'cpp'}],
			extended_valid_elements: "b,i,b/strong,i/em",
			plugins: [
				'advlist autolink lists link image charmap print preview hr anchor pagebreak',
				'searchreplace wordcount visualblocks visualchars code codesample fullscreen',
				'insertdatetime media nonbreaking save table directionality',
				'template paste textcolor colorpicker textpattern imagetools'
			],
			menu: {},
			menubar: false,
			toolbar1: "formatselect fontsizeselect | bold italic underline strikethrough superscript subscript | forecolor backcolor link unlink",
			toolbar2: "outdent indent bullist numlist | alignleft aligncenter alignright alignjustify | table image media codesample",
			save_onsavecallback: function () {
				Mousetrap.trigger('ctrl+s');
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
		tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.get('editorId'));
	},

	actions: {
		onInsertLink(link) {
			let editor = tinymce.EditorManager.get(this.get('editorId'));
			let userSelection = editor.selection.getContent();

			if (is.not.empty(userSelection)) {
				set(link, 'title', userSelection);
			}

			let linkHTML = this.get('link').buildLink(link);
			editor.insertContent(linkHTML);

			return true;
		},

		isDirty() {
			let editor = tinymce.EditorManager.get(this.get('editorId'));
			return is.not.undefined(tinymce) && is.not.undefined(editor) && editor.isDirty();
		},

		onCancel() {
			let cb = this.get('onCancel');
			cb();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');
			let editor = tinymce.EditorManager.get(this.get('editorId'));

			page.set('title', title);
			meta.set('rawBody', editor.getContent());

			let cb = this.get('onAction');
			cb(page, meta);
		}
	}
});
