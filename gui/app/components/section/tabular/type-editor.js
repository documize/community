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
import Modals from '../../../mixins/modal';
import Notifier from '../../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Modals, Notifier, {
	appMeta: service(),
	link: service(),
	pageBody: '',
	editorId: computed('page', function () {
		let page = this.get('page');
		return `tabular-editor-${page.id}`;
	}),
	modalId: computed('page', function () {
		let page = this.get('page');
		return `tabular-editor-modal-${page.id}`;
	}),
	importData: '',
	importOption: null,
	defaultTable: '<table class="wysiwyg-table" style="width: 100%;"><thead><tr><th><br></th><th><br></th><th><br></th><th><br></th></tr></thead><tbody><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr></tbody></table>',

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('pageBody', this.get('meta.rawBody'));

		if (_.isEmpty(this.get('pageBody'))) {
			this.set('pageBody', this.get('defaultTable'));
		}

		this.set('importOption', {
			headers: true,
			parseTypes: false,
		});
	},


	didInsertElement() {
		this._super(...arguments);

		this.addEditor();
	},

	willDestroyElement() {
		this._super(...arguments);

		this.removeEditor();
	},

	addEditor() {
		schedule('afterRender', () => {
			let options = {
				cache_suffix: '?v=513',
				selector: '#' + this.get('editorId'),
				relative_urls: false,
				browser_spellcheck: true,
				statusbar: false,
				inline: true,
				paste_data_images: true,
				images_upload_handler: function (blobInfo, success, failure) { // eslint-disable-line no-unused-vars
					success("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64());
				},
				image_advtab: true,
				media_live_embeds: true,
				theme: 'silver',
				skin: 'oxide',
				entity_encoding: 'raw',
				extended_valid_elements: 'b,i,b/strong,i/em',
				fontsize_formats:
					'8px 10px 12px 14px 15px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 38px 40px 42px 44px 46px 48px 50px 52px 54px 56px 58px 60px 70px 80px 90px 100px',
				formats: {
					bold: {
						inline: 'b'
					},
					italic: {
						inline: 'i'
					}
				},
				plugins: [
					'advlist autolink lists link image charmap print hr pagebreak',
					'searchreplace wordcount visualblocks visualchars code codesample fullscreen',
					'insertdatetime media nonbreaking save table directionality',
					'template paste textpattern imagetools'
				],
				menu: {},
				menubar: false,
				table_toolbar: '',
				toolbar1: 'table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
				toolbar2: 'fontsizeselect | forecolor backcolor link unlink | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify',
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

	removeEditor() {
		tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.get('editorId'));
	},

	generateImportTable(results) {
		// nothing to import?
		if (_.isUndefined(results) || results.data.length === 0) {
			return;
		}

		let opts = this.get('importOption');

		let table = '<table class="wysiwyg-table" style="width: 100%;"><thead><tr>';

		// Setup the table headers
		if (opts.headers && _.isArray(results.meta.fields)) {
			// use headers from file
			results.meta.fields.forEach((header) => {
				table = table + '<th>' + header.trim() + '</th>';
			});
		} else {
			// create dummy headers
			for (let i = 1; i <= results.data[0].length; i++) {
				table = table + '<th>Column ' + i + '</th>';
			}
		}

		table = table + '</tr></thead>'

		// now convert data rows to table.
		table = table + '<tbody>'

		results.data.forEach(row => {
			table = table + '<tr>';

			if (_.isArray(row)) {
				row.forEach((cell) => {
					table = table + '<td>' + cell.trim() + '</td>';
				});
			} else {
				// convert Javascript object to array
				let cells = Object.values(row);

				cells.forEach((cell) => {
					table = table + '<td>' + cell.trim() + '</td>';
				});
			}

			table = table + '</tr>'
		});

		table = table + '</tbody>'
		table = table +  '</table>';

		let editor = tinymce.EditorManager.get(this.get('editorId'));
		editor.setContent(table);
	},

	actions: {
		onShowImportModal() {
			this.modalOpen('#' + this.get('modalId'), {show:true}, "#csv-data");
		},

		onImport() {
			let csv = this.get('importData');
			let opts = this.get('importOption');

			this.modalClose('#' + this.get('modalId'));

			if (_.isEmpty(csv)) {
				return;
			}

			let results = Papa.parse(csv, {
				header: opts.headers,
				dynamicTyping: opts.parseTypes,
				skipEmptyLines: true,
			});

			this.generateImportTable(results);
		},

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
