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
import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	appMeta: service(),
	link: service(),
	pageBody: '',
	editorId: computed('page', function () {
		let page = this.get('page');
		return `wysiwyg-editor-${page.id}`;
	}),
	scrollFix: false,

	didReceiveAttrs() {
		this._super(...arguments);
		this.set('pageBody', this.get('meta.rawBody'));
	},

	didInsertElement() {
		this._super(...arguments);

		if ($('html').css('overflow-y') === 'scroll') {
			this.set('scrollFix', true);
			$('html').css('overflow-y', 'unset');
		} else {
			this.set('scrollFix', false);
		}

		schedule('afterRender', () => {
			let options = {
				cache_suffix: '?v=513',
				selector: '#' + this.get('editorId'),
				relative_urls: false,
				browser_spellcheck: true,
				contextmenu: false,
				statusbar: false,
				inline: false,
				paste_data_images: true,
				images_upload_handler: function (blobInfo, success, failure) { // eslint-disable-line no-unused-vars
					success("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64());
				},
				image_advtab: true,
				image_caption: true,
				media_live_embeds: true,
				theme: 'silver',
				skin: 'oxide',
				entity_encoding: 'raw',
				extended_valid_elements: 'b,i,b/strong,i/em',
				fontsize_formats:
					'8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 38px 40px 42px 44px 46px 48px 50px 52px 54px 56px 58px 60px 70px 80px 90px 100px',
				formats: {
					bold: {
						inline: 'b'
					},
					italic: {
						inline: 'i'
					}
				},
				codesample_content_css: '//' + window.location.host + '/prism/prism.css',
				codesample_languages: [
					{ text: 'ASP.NET (C#)', value: 'aspnet' },
					{ text: 'C', value: 'c' },
					{ text: 'C#', value: 'csharp' },
					{ text: 'C++', value: 'cpp' },
					{ text: 'CSS', value: 'css' },
					{ text: 'Docker', value: 'docker' },
					{ text: 'Elixir', value: 'elixir' },
					{ text: 'Erlang', value: 'erlang' },
					{ text: 'Fsharp', value: 'fsharp' },
					{ text: 'Git', value: 'git' },
					{ text: 'Go', value: 'go' },
					{ text: 'GraphQL', value: 'graphql' },
					{ text: 'Haskell', value: 'haskell' },
					{ text: 'HTML', value: 'markup' },
					{ text: 'HTTP', value: 'http' },
					{ text: 'Java', value: 'java' },
					{ text: 'JavaScript', value: 'javascript' },
					{ text: 'JSON', value: 'json' },
					{ text: 'Less', value: 'less' },
					{ text: 'Makefile', value: 'makefile' },
					{ text: 'Markdown', value: 'markdown' },
					{ text: 'nginx', value: 'nginx' },
					{ text: 'Objective C', value: 'objectivec' },
					{ text: 'Perl', value: 'perl' },
					{ text: 'PHP', value: 'php' },
					{ text: 'Powershell', value: 'powershell' },
					{ text: 'Python', value: 'python' },
					{ text: 'Ruby', value: 'ruby' },
					{ text: 'Rust', value: 'rust' },
					{ text: 'Sass SCSS', value: 'scss' },
					{ text: 'Shell', value: 'bash' },
					{ text: 'SQL', value: 'sql' },
					{ text: 'Swift', value: 'swift' },
					{ text: 'TypeScript', value: 'typescript' },
					{ text: 'VB.Net', value: 'vbnet' },
					{ text: 'XML', value: 'markup' },
					{ text: 'YAML', value: 'yaml' }
				],
				plugins: [
					'advlist autolink autoresize lists link image charmap print hr pagebreak',
					'searchreplace wordcount visualblocks visualchars code codesample fullscreen',
					'insertdatetime media nonbreaking save table directionality',
					'template paste textpattern imagetools'
				],
				menu: {},
				menubar: false,
				toolbar: [
					'formatselect fontsizeselect | bold italic underline strikethrough superscript subscript blockquote | forecolor backcolor link unlink',
					'outdent indent bullist numlist | alignleft aligncenter alignright alignjustify | table uploadimage image media codesample'
				],
				toolbar_sticky: true,
				save_onsavecallback: function () {
					Mousetrap.trigger('ctrl+s');
				}
			};

			if (typeof tinymce === 'undefined') {
				$.getScript('/tinymce/tinymce.min.js?v=513', function () {
					window.tinymce.dom.Event.domLoaded = true;
					tinymce.baseURL = '//' + window.location.host + '/tinymce';
					tinymce.suffix = '.min';
					tinymce.init(options);
				});
			} else {
				tinymce.init(options);
			}
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.get('editorId'));

		if (this.get('scrollFix')) {
			this.set('scrollFix', false);
			$('html').css('overflow-y', 'scroll');
		}
	},

	actions: {
		onInsertLink(link) {
			let editor = tinymce.EditorManager.get(this.get('editorId'));
			let userSelection = editor.selection.getContent();

			if (!_.isEmpty(userSelection)) {
				set(link, 'title', userSelection);
			}

			let linkHTML = this.get('link').buildLink(link);
			editor.insertContent(linkHTML);

			return true;
		},

		isDirty() {
			let editor = tinymce.EditorManager.get(this.get('editorId'));
			return (
				!_.isUndefined(tinymce) &&
				!_.isUndefined(editor) &&
				editor.isDirty()
			);
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
